package entity

import "gorm.io/gorm"

type Verdict int

const (
	CORRECT Verdict = iota
	WRONG
	PENDING
)

type Submission struct {
	gorm.Model
	UserID     uint
	User       User
	QuestionID uint
	Question   QnA
	Answer     []byte
	Verdict    Verdict
}
