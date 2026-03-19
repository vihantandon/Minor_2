package dto

import "time"

// Create contest request
type CreateContestRequest struct {
	Title       string    `json:"title" binding:"required,min=3,max=100"`
	Description string    `json:"description"`
	StartsAt    time.Time `json:"starts_at" binding:"required"`
	EndsAt      time.Time `json:"ends_at" binding:"required"`
}

// Assign questions request
type AssignQuestionsRequest struct {
	Questions []AssignQuestion `json:"questions" binding:"required,min=1"`
}

type AssignQuestion struct {
	QuestionID uint `json:"question_id" binding:"required"`
	OrderIndex int  `json:"order_index"`
	MaxScore   int  `json:"max_score"`
}

// Response types
type ContestDTO struct {
	ID          uint                 `json:"id"`
	Title       string               `json:"title"`
	Description string               `json:"description"`
	StartsAt    time.Time            `json:"starts_at"`
	EndsAt      time.Time            `json:"ends_at"`
	Status      int                  `json:"status"`
	CreatedBy   uint                 `json:"created_by"`
	Questions   []ContestQuestionDTO `json:"questions,omitempty"`
}

type ContestQuestionDTO struct {
	ID         uint        `json:"id"`
	QuestionID uint        `json:"question_id"`
	OrderIndex int         `json:"order_index"`
	MaxScore   int         `json:"max_score"`
	Question   QuestionDTO `json:"question,omitempty"`
}

type QuestionDTO struct {
	ID         uint   `json:"id"`
	Question   string `json:"question"`
	Topic      string `json:"topic"`
	Difficulty int    `json:"difficulty"`
	QType      int    `json:"q_type"`
}
