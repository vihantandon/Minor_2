package repository

import (
	"olympiad/app/entity"
	"time"

	"gorm.io/gorm"
)

type SubmissionRepository struct {
	db *gorm.DB
}

func NewSubmissionRepository(db *gorm.DB) *SubmissionRepository {
	return &SubmissionRepository{db: db}
}

// Create persists a new submission.
func (r *SubmissionRepository) Create(s *entity.Submission) error {
	return r.db.Create(s).Error
}

// CountByUserAndQuestion returns how many times a user has submitted
// for a specific question in a specific contest. Used to determine AttemptNumber.
func (r *SubmissionRepository) CountByUserAndQuestion(userID, contestID, questionID uint) (int64, error) {
	var count int64
	err := r.db.Model(&entity.Submission{}).
		Where("user_id = ? AND contest_id = ? AND question_id = ?", userID, contestID, questionID).
		Count(&count).Error
	return count, err
}

// LastByUserAndQuestion fetches the most recent submission for a user/contest/question.
// Used by the rating engine to get the final answer state.
func (r *SubmissionRepository) LastByUserAndQuestion(userID, contestID, questionID uint) (*entity.Submission, error) {
	var s entity.Submission
	err := r.db.Where("user_id = ? AND contest_id = ? AND question_id = ?", userID, contestID, questionID).
		Order("attempt_number DESC").
		First(&s).Error
	if err == gorm.ErrRecordNotFound {
		return nil, nil
	}
	return &s, err
}

// FindByContestAndUser returns all submissions for a user in a contest,
// one per question (the last submission). Used by the rating engine.
func (r *SubmissionRepository) FindLastPerQuestionByContestAndUser(contestID, userID uint) ([]entity.Submission, error) {
	// Subquery: for each (contest_id, user_id, question_id) get max attempt_number,
	// then join back to get the full row.
	var subs []entity.Submission
	err := r.db.Raw(`
		SELECT s.*
		FROM submissions s
		INNER JOIN (
			SELECT contest_id, user_id, question_id, MAX(attempt_number) AS max_attempt
			FROM submissions
			WHERE contest_id = ? AND user_id = ? AND deleted_at IS NULL
			GROUP BY contest_id, user_id, question_id
		) latest ON s.contest_id = latest.contest_id
			AND s.user_id = latest.user_id
			AND s.question_id = latest.question_id
			AND s.attempt_number = latest.max_attempt
		WHERE s.deleted_at IS NULL
	`, contestID, userID).Scan(&subs).Error
	return subs, err
}

// FindAllUsersInContest returns distinct user IDs who submitted in a contest.
func (r *SubmissionRepository) FindAllUsersInContest(contestID uint) ([]uint, error) {
	var userIDs []uint
	err := r.db.Model(&entity.Submission{}).
		Where("contest_id = ?", contestID).
		Distinct("user_id").
		Pluck("user_id", &userIDs).Error
	return userIDs, err
}

// CountContestsByUser returns how many distinct contests a user has participated in.
// Used to determine K factor.
func (r *SubmissionRepository) CountContestsByUser(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&entity.Submission{}).
		Where("user_id = ?", userID).
		Distinct("contest_id").
		Count(&count).Error
	return count, err
}

// AverageSubmitTimeForQuestion returns the average time (in seconds from contest start)
// across all users for a given question in a contest. Used for the time multiplier.
func (r *SubmissionRepository) AverageSubmitTimeForQuestion(contestID, questionID uint, contestStart time.Time) (float64, error) {
	// We only look at submissions where a correct answer was submitted,
	// specifically the last submission per user (which is the scored one).
	// For simplicity we use all last-submissions regardless of verdict,
	// since we want a real average of when people submitted.
	var avgSeconds float64
	err := r.db.Raw(`
		SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (s.submitted_at - ?))), 0)
		FROM submissions s
		INNER JOIN (
			SELECT user_id, MAX(attempt_number) AS max_attempt
			FROM submissions
			WHERE contest_id = ? AND question_id = ? AND deleted_at IS NULL
			GROUP BY user_id
		) latest ON s.user_id = latest.user_id AND s.attempt_number = latest.max_attempt
		WHERE s.contest_id = ? AND s.question_id = ? AND s.deleted_at IS NULL
	`, contestStart, contestID, questionID, contestID, questionID).
		Scan(&avgSeconds).Error
	return avgSeconds, err
}

// UserSubmitTimeForQuestion returns the time in seconds from contest start
// when the user made their last submission on a question.
func (r *SubmissionRepository) UserSubmitTimeForQuestion(userID, contestID, questionID uint, contestStart time.Time) (float64, error) {
	var seconds float64
	err := r.db.Raw(`
		SELECT EXTRACT(EPOCH FROM (submitted_at - ?))
		FROM submissions
		WHERE user_id = ? AND contest_id = ? AND question_id = ? AND deleted_at IS NULL
		ORDER BY attempt_number DESC
		LIMIT 1
	`, contestStart, userID, contestID, questionID).
		Scan(&seconds).Error
	return seconds, err
}
