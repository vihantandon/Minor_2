package service

import (
	"context"
	"math"
	"olympiad/app/entity"
	"olympiad/app/repository"
	"strconv"

	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
)

// Difficulty → rating scale: LOW=800, MEDIUM=1400, HIGH=2000
var difficultyRatingMap = map[int]float64{
	0: 800,
	1: 1400,
	2: 2000,
}

const (
	minRating       = 400.0
	maxDelta        = 200.0
	kFactorNew      = 40.0
	kFactorMid      = 20.0
	kFactorSeasoned = 10.0
)

type userResult struct {
	userID     uint
	totalScore float64
	deltaSum   float64
}

type RatingService struct {
	submissionRepo *repository.SubmissionRepository
	userRepo       *repository.UserRepository
	contestRepo    *repository.ContestRepository
	rdb            *redis.Client
	sugar          *zap.SugaredLogger
}

func NewRatingService(
	submissionRepo *repository.SubmissionRepository,
	userRepo *repository.UserRepository,
	contestRepo *repository.ContestRepository,
	rdb *redis.Client,
	sugar *zap.SugaredLogger,
) *RatingService {
	return &RatingService{
		submissionRepo: submissionRepo,
		userRepo:       userRepo,
		contestRepo:    contestRepo,
		rdb:            rdb,
		sugar:          sugar,
	}
}

// ProcessLiveContests is called by the 15-min scheduler.
// Processes all LIVE contests and updates participant ratings + Redis leaderboard.
func (s *RatingService) ProcessLiveContests() error {
	contests, err := s.contestRepo.FindAll()
	if err != nil {
		return err
	}
	for _, c := range contests {
		if c.Status != entity.LIVE {
			continue
		}
		if err := s.processContest(&c); err != nil {
			s.sugar.Errorf("rating: failed to process contest %d: %v", c.ID, err)
		}
	}
	return nil
}

func (s *RatingService) processContest(contest *entity.Contest) error {
	userIDs, err := s.submissionRepo.FindAllUsersInContest(contest.ID)
	if err != nil || len(userIDs) == 0 {
		return err
	}

	// Phase 1 + 2: compute per-user total score and delta sum
	results := make([]userResult, 0, len(userIDs))
	for _, uid := range userIDs {
		totalScore, deltaSum, err := s.computeUserDelta(contest, uid)
		if err != nil {
			s.sugar.Errorf("rating: computeUserDelta user=%d contest=%d: %v", uid, contest.ID, err)
			continue
		}
		results = append(results, userResult{uid, totalScore, deltaSum})
	}

	// Phase 3: rank bonus — sort by totalScore descending
	n := len(results)
	for i := 1; i < n; i++ {
		for j := i; j > 0 && results[j].totalScore > results[j-1].totalScore; j-- {
			results[j], results[j-1] = results[j-1], results[j]
		}
	}

	for rank, res := range results {
		percentile := float64(rank+1) / float64(n) // 0 = top, 1 = bottom

		var rankBonus float64
		switch {
		case percentile <= 0.10:
			rankBonus = +20
		case percentile <= 0.25:
			rankBonus = +10
		case percentile >= 0.75:
			rankBonus = -10
		default:
			rankBonus = 0
		}

		// Final: R_new = R_old + clamp(ΣΔRⱼ + rank_bonus, -200, +200)
		clampedDelta := clamp(res.deltaSum+rankBonus, -maxDelta, maxDelta)
		if err := s.applyRatingDelta(res.userID, clampedDelta); err != nil {
			s.sugar.Errorf("rating: applyRatingDelta user=%d: %v", res.userID, err)
		}
	}

	s.updateRedisLeaderboard(contest.ID, results)
	return nil
}

// computeUserDelta runs Phase 1 + Phase 2 for one user.
// Returns (totalPhase1Score, sumOfΔRⱼ).
func (s *RatingService) computeUserDelta(contest *entity.Contest, userID uint) (float64, float64, error) {
	user, err := s.userRepo.FindByID(userID)
	if err != nil || user == nil {
		return 0, 0, err
	}
	userRating := math.Max(float64(user.Score), minRating)

	gamesPlayed, err := s.submissionRepo.CountContestsByUser(userID)
	if err != nil {
		return 0, 0, err
	}
	k := kFactor(int(gamesPlayed))

	// Need the full contest with questions preloaded
	fullContest, err := s.contestRepo.FindByID(contest.ID)
	if err != nil || fullContest == nil {
		return 0, 0, err
	}

	var totalScore, deltaSum float64
	for _, cq := range fullContest.Questions {
		q := cq.Question
		maxScore := float64(cq.MaxScore)

		// Phase 1: per-question score with time multiplier
		questionScore, err := s.calcQuestionScore(contest, userID, &cq, maxScore)
		if err != nil {
			s.sugar.Warnf("rating: calcQuestionScore q=%d u=%d: %v", q.ID, userID, err)
			continue
		}
		totalScore += questionScore

		// Phase 2: Eⱼ = 1 / (1 + 10^((Dⱼ - Rᵢ) / 400))
		//          Aⱼ = questionScore / maxScore
		//          ΔRⱼ = K × (Aⱼ - Eⱼ)
		dj := difficultyRatingMap[int(q.Difficulty)]
		ej := expectedScore(dj, userRating)
		aj := questionScore / maxScore
		deltaSum += k * (aj - ej)
	}

	return totalScore, deltaSum, nil
}

// calcQuestionScore implements Phase 1 scoring rules + time multiplier.
func (s *RatingService) calcQuestionScore(
	contest *entity.Contest,
	userID uint,
	cq *entity.ContestQuestion,
	maxScore float64,
) (float64, error) {
	lastSub, err := s.submissionRepo.LastByUserAndQuestion(userID, contest.ID, cq.Question.ID)
	if err != nil {
		return 0, err
	}
	if lastSub == nil {
		return 0, nil // no submission → 0 score
	}

	attempts := lastSub.AttemptNumber
	var rawScore float64

	switch cq.Question.Q_type {
	case entity.MCQ:
		// 1st attempt correct → full. 2nd correct → 0.6×. Else → 0.
		if lastSub.Verdict == entity.CORRECT {
			if attempts == 1 {
				rawScore = maxScore
			} else {
				rawScore = 0.6 * maxScore
			}
		}
	case entity.NUMERICAL:
		// score = max_score − (attempts × 0.1 × max_score), floor 0
		if lastSub.Verdict == entity.CORRECT {
			rawScore = math.Max(maxScore-float64(attempts)*0.1*maxScore, 0)
		}
	}

	// Time multiplier: compare user's submission time to average across all users
	avgTime, err := s.submissionRepo.AverageSubmitTimeForQuestion(contest.ID, cq.Question.ID, contest.StartsAt)
	if err != nil || avgTime == 0 {
		return rawScore, nil // can't compute multiplier, use raw
	}
	userTime, err := s.submissionRepo.UserSubmitTimeForQuestion(userID, contest.ID, cq.Question.ID, contest.StartsAt)
	if err != nil {
		return rawScore, nil
	}

	var multiplier float64
	switch {
	case userTime < 0.25*avgTime:
		multiplier = 1.15
	case userTime > 1.50*avgTime:
		multiplier = 0.85
	default:
		multiplier = 1.0
	}

	return rawScore * multiplier, nil
}

func (s *RatingService) applyRatingDelta(userID uint, delta float64) error {
	user, err := s.userRepo.FindByID(userID)
	if err != nil || user == nil {
		return err
	}
	newScore := math.Max(float64(user.Score)+delta, minRating)
	return s.userRepo.UpdateScore(userID, int(math.Round(newScore)))
}

func (s *RatingService) updateRedisLeaderboard(contestID uint, results []userResult) {
	ctx := context.Background()
	key := "contest:" + strconv.Itoa(int(contestID)) + ":lb"
	pipe := s.rdb.Pipeline()
	for _, r := range results {
		pipe.ZAdd(ctx, key, redis.Z{
			Score:  r.totalScore,
			Member: strconv.Itoa(int(r.userID)),
		})
	}
	if _, err := pipe.Exec(ctx); err != nil {
		s.sugar.Errorf("rating: redis leaderboard update: %v", err)
	}
}

// --- Pure math functions ---

// Eⱼ = 1 / (1 + 10^((Dⱼ - Rᵢ) / 400))
func expectedScore(questionDifficulty, userRating float64) float64 {
	return 1.0 / (1.0 + math.Pow(10, (questionDifficulty-userRating)/400))
}

func kFactor(gamesPlayed int) float64 {
	switch {
	case gamesPlayed < 10:
		return kFactorNew
	case gamesPlayed < 30:
		return kFactorMid
	default:
		return kFactorSeasoned
	}
}

func clamp(val, low, high float64) float64 {
	return math.Max(low, math.Min(high, val))
}
