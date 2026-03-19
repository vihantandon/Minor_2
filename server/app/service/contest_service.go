package service

import (
	"errors"
	"olympiad/app/dto"
	"olympiad/app/entity"
	"olympiad/app/repository"
	"time"
)

var (
	ErrContestNotFound    = errors.New("contest not found")
	ErrContestTimeInvalid = errors.New("ends_at must be after starts_at")
	ErrQuestionNotFound   = errors.New("one or more questions not found")
)

type ContestService struct {
	contestRepo  *repository.ContestRepository
	questionRepo *repository.QuestionRepository
}

func NewContestService(
	contestRepo *repository.ContestRepository,
	questionRepo *repository.QuestionRepository,
) *ContestService {
	return &ContestService{
		contestRepo:  contestRepo,
		questionRepo: questionRepo,
	}
}

func (s *ContestService) CreateContest(req *dto.CreateContestRequest, adminID uint) (*dto.ContestDTO, error) {
	if !req.EndsAt.After(req.StartsAt) {
		return nil, ErrContestTimeInvalid
	}

	contest := &entity.Contest{
		Title:       req.Title,
		Description: req.Description,
		StartsAt:    req.StartsAt,
		EndsAt:      req.EndsAt,
		Status:      entity.SCHEDULED,
		CreatedBy:   adminID,
	}

	if err := s.contestRepo.Create(contest); err != nil {
		return nil, err
	}

	return toContestDTO(contest, nil), nil
}

func (s *ContestService) AssignQuestions(contestID uint, req *dto.AssignQuestionsRequest) (*dto.ContestDTO, error) {
	contest, err := s.contestRepo.FindByID(contestID)
	if err != nil {
		return nil, err
	}
	if contest == nil {
		return nil, ErrContestNotFound
	}

	for _, aq := range req.Questions {
		// Verify question exists
		q, err := s.questionRepo.FindByID(aq.QuestionID)
		if err != nil {
			return nil, err
		}
		if q == nil {
			return nil, ErrQuestionNotFound
		}

		maxScore := aq.MaxScore
		if maxScore == 0 {
			maxScore = 100 // default
		}

		cq := &entity.ContestQuestion{
			ContestID:  contestID,
			QuestionID: aq.QuestionID,
			OrderIndex: aq.OrderIndex,
			MaxScore:   maxScore,
		}
		if err := s.contestRepo.AddQuestion(cq); err != nil {
			return nil, err
		}
	}

	// Reload with questions
	updated, err := s.contestRepo.FindByID(contestID)
	if err != nil {
		return nil, err
	}

	return toContestDTO(updated, updated.Questions), nil
}

func (s *ContestService) GetContest(id uint) (*dto.ContestDTO, error) {
	contest, err := s.contestRepo.FindByID(id)
	if err != nil {
		return nil, err
	}
	if contest == nil {
		return nil, ErrContestNotFound
	}
	return toContestDTO(contest, contest.Questions), nil
}

func (s *ContestService) ListContests() ([]dto.ContestDTO, error) {
	contests, err := s.contestRepo.FindAll()
	if err != nil {
		return nil, err
	}
	var dtos []dto.ContestDTO
	for _, c := range contests {
		dtos = append(dtos, *toContestDTO(&c, nil))
	}
	return dtos, nil
}

// Helper — strips Answer from questions before returning
func toContestDTO(c *entity.Contest, cqs []entity.ContestQuestion) *dto.ContestDTO {
	d := &dto.ContestDTO{
		ID:          c.ID,
		Title:       c.Title,
		Description: c.Description,
		StartsAt:    c.StartsAt,
		EndsAt:      c.EndsAt,
		Status:      int(c.Status),
		CreatedBy:   c.CreatedBy,
	}
	for _, cq := range cqs {
		d.Questions = append(d.Questions, dto.ContestQuestionDTO{
			ID:         cq.ID,
			QuestionID: cq.QuestionID,
			OrderIndex: cq.OrderIndex,
			MaxScore:   cq.MaxScore,
			Question: dto.QuestionDTO{
				ID:         cq.Question.ID,
				Question:   cq.Question.Question,
				Topic:      cq.Question.Topic,
				Difficulty: int(cq.Question.Difficulty),
				QType:      int(cq.Question.Q_type),
				// Answer field intentionally absent
			},
		})
	}
	return d
}

// UpdateContestStatuses is called by the scheduler
func (s *ContestService) UpdateContestStatuses() error {
	now := time.Now()
	contests, err := s.contestRepo.FindAll()
	if err != nil {
		return err
	}
	for _, c := range contests {
		var newStatus entity.ContestStatus
		switch {
		case now.Before(c.StartsAt):
			newStatus = entity.SCHEDULED
		case now.After(c.EndsAt):
			newStatus = entity.ENDED
		default:
			newStatus = entity.LIVE
		}
		if newStatus != c.Status {
			_ = s.contestRepo.UpdateStatus(c.ID, newStatus)
		}
	}
	return nil
}
