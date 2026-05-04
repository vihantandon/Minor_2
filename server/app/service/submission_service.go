package service

import (
	"errors"
	"olympiad/app/dto"
	"olympiad/app/entity"
	"olympiad/app/repository"
	"strings"
	"time"
)

var (
	ErrContestNotActive     = errors.New("contest is not currently live")
	ErrQuestionNotInContest = errors.New("question does not belong to this contest")
)

type SubmissionService struct {
	submissionRepo *repository.SubmissionRepository
	contestRepo    *repository.ContestRepository
	questionRepo   *repository.QuestionRepository
}

func NewSubmissionService(
	submissionRepo *repository.SubmissionRepository,
	contestRepo *repository.ContestRepository,
	questionRepo *repository.QuestionRepository,
) *SubmissionService {
	return &SubmissionService{
		submissionRepo: submissionRepo,
		contestRepo:    contestRepo,
		questionRepo:   questionRepo,
	}
}

// Submit processes a user's answer for a question in a contest.
// It validates the contest is live, the question belongs to it,
// determines the attempt number, grades the answer, and persists.
func (s *SubmissionService) Submit(req *dto.SubmitRequest, contestID, userID uint) (*dto.SubmitResponse, error) {
	// 1. Validate contest is LIVE
	contest, err := s.contestRepo.FindByID(contestID)
	if err != nil {
		return nil, err
	}
	if contest == nil || contest.Status != entity.LIVE {
		return nil, ErrContestNotActive
	}

	// 2. Validate question belongs to this contest
	var contestQuestion *entity.ContestQuestion
	for i := range contest.Questions {
		if contest.Questions[i].QuestionID == req.QuestionID {
			contestQuestion = &contest.Questions[i]
			break
		}
	}
	if contestQuestion == nil {
		return nil, ErrQuestionNotInContest
	}

	// 3. Fetch the actual question (need Answer + Q_type)
	question, err := s.questionRepo.FindByID(req.QuestionID)
	if err != nil || question == nil {
		return nil, ErrQuestionNotFound
	}

	// 4. Determine attempt number (previous count + 1)
	prevCount, err := s.submissionRepo.CountByUserAndQuestion(userID, contestID, req.QuestionID)
	if err != nil {
		return nil, err
	}
	attemptNumber := int(prevCount) + 1

	// 5. Grade the answer
	verdict := gradeAnswer(req.Answer, string(question.Answer))

	// 6. Compute question score for this submission
	// The rating engine will re-compute the definitive score at its 15-min tick,
	// but we store a per-submission score here for convenience.
	maxScore := float64(contestQuestion.MaxScore)
	questionScore := calcSubmissionScore(question.Q_type, verdict, attemptNumber, maxScore)

	// 7. Persist
	sub := &entity.Submission{
		UserID:        userID,
		ContestID:     contestID,
		QuestionID:    req.QuestionID,
		Answer:        []byte(req.Answer),
		Verdict:       verdict,
		AttemptNumber: attemptNumber,
		QuestionScore: questionScore,
		SubmittedAt:   time.Now().UTC(),
	}
	if err := s.submissionRepo.Create(sub); err != nil {
		return nil, err
	}

	return &dto.SubmitResponse{
		SubmissionID:  sub.ID,
		AttemptNumber: attemptNumber,
	}, nil
}

// gradeAnswer normalizes both strings and compares them.
// Normalization: trim whitespace, lowercase, collapse internal spaces.
func gradeAnswer(submitted, correct string) entity.Verdict {
	if normalizeAnswer(submitted) == normalizeAnswer(correct) {
		return entity.CORRECT
	}
	return entity.WRONG
}

func normalizeAnswer(s string) string {
	s = strings.TrimSpace(s)
	s = strings.ToLower(s)
	// Collapse multiple spaces into one
	fields := strings.Fields(s)
	return strings.Join(fields, " ")
}

// calcSubmissionScore computes the score for this specific submission
// (without the time multiplier — that's applied by the rating engine
// which has access to the average time across all users).
func calcSubmissionScore(qType entity.QType, verdict entity.Verdict, attempt int, maxScore float64) float64 {
	if verdict != entity.CORRECT {
		return 0
	}
	switch qType {
	case entity.MCQ:
		if attempt == 1 {
			return maxScore
		}
		return 0.6 * maxScore
	case entity.NUMERICAL:
		score := maxScore - float64(attempt)*0.1*maxScore
		if score < 0 {
			return 0
		}
		return score
	default:
		return 0
	}
}
