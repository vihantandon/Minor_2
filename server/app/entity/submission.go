package entity

import (
	"time"

	"gorm.io/gorm"
)

type Verdict int

const (
	CORRECT Verdict = iota
	WRONG
	PENDING
)

type Submission struct {
	gorm.Model
	UserID        uint      `gorm:"not null;index"`
	User          User      `gorm:"foreignKey:UserID"`
	ContestID     uint      `gorm:"not null;index"`
	Contest       Contest   `gorm:"foreignKey:ContestID"`
	QuestionID    uint      `gorm:"not null;index"`
	Question      QnA       `gorm:"foreignKey:QuestionID"`
	Answer        []byte    `gorm:"not null"`
	Verdict       Verdict   `gorm:"default:2"`
	AttemptNumber int       `gorm:"not null;default:1"`
	QuestionScore float64   `gorm:"default:0"`
	SubmittedAt   time.Time `gorm:"not null"`
}
