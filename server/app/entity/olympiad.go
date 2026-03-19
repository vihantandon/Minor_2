package entity

import "gorm.io/gorm"

type QType int

const (
	MCQ QType = iota
	NUMERICAL
)

type Difficulty int

const (
	LOW Difficulty = iota
	MEDIUM
	HIGH
)

func LeveltoDifficulty(level int) Difficulty {
	switch {
	case level <= 2:
		return LOW
	case level == 3:
		return MEDIUM
	default:
		return HIGH
	}
}

type QnA struct {
	gorm.Model
	Unique_ID  uint32
	Difficulty Difficulty
	Question   string `gorm:"uniqueIndex"`
	Topic      string
	Answer     []byte
	Solution   string
	Q_type     QType
	Options    []QnAOption
}

type QnAOption struct {
	gorm.Model
	QnAID      uint   `gorm:"not null;index"`
	OptionKey  string `gorm:"not null"`
	OptionText string `gorm:"not null"`
}
