package entity

import "gorm.io/gorm"

type Verdict int

const (
	CORRECT Verdict = iota
	WRONG
	PENDING
)

type submission struct {
	gorm.Model
	UserID     uint
	User       User
	QuestionID uint
	Question   QnA
	Answer     []byte
	Verdict    Verdict
}
