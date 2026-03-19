package repository

import (
	"errors"
	"olympiad/app/entity"

	"gorm.io/gorm"
)

type QuestionRepository struct {
	db *gorm.DB
}

func NewQuestionRepository(db *gorm.DB) *QuestionRepository {
	return &QuestionRepository{db: db}
}

func (r *QuestionRepository) FindByID(id uint) (*entity.QnA, error) {
	var q entity.QnA
	result := r.db.First(&q, id)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &q, result.Error
}
