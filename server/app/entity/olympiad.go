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
	case level == 1:
		return LOW
	case level < 5:
		return MEDIUM
	default:
		return HIGH
	}
}

type QnA struct {
	gorm.Model
	Unique_ID  uint32
	Difficulty Difficulty
	Question   string
	Topic      string
	Answer     []byte
	Solution   string
	Q_type     QType
}
