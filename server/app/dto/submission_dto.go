package dto

// POST /api/contests/:id/submit
type SubmitRequest struct {
	QuestionID uint   `json:"question_id" binding:"required"`
	Answer     string `json:"answer" binding:"required"`
}

type SubmitResponse struct {
	SubmissionID  uint `json:"submission_id"`
	AttemptNumber int  `json:"attempt_number"`
}

type UserMeResponse struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     int    `json:"role"`
	Score    int    `json:"score"`
}
