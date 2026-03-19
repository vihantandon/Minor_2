package entity

import (
	"time"

	"gorm.io/gorm"
)

type ContestStatus int

const (
	SCHEDULED ContestStatus = iota
	LIVE
	ENDED
)

type Contest struct {
	gorm.Model
	Title       string `gorm:"not null"`
	Description string
	StartsAt    time.Time     `gorm:"not null"`
	EndsAt      time.Time     `gorm:"not null"`
	Status      ContestStatus `gorm:"default:0"`
	CreatedBy   uint
	User        User              `gorm:"foreignKey:CreatedBy"`
	Questions   []ContestQuestion `gorm:"foreignKey:ContestID"`
}

type ContestQuestion struct {
	gorm.Model
	ContestID  uint    `gorm:"not null;index"`
	Contest    Contest `gorm:"foreignKey:ContestID"`
	QuestionID uint    `gorm:"not null"`
	Question   QnA     `gorm:"foreignKey:QuestionID"`
	OrderIndex int     `gorm:"default:0"`
	MaxScore   int     `gorm:"default:100"`
}
