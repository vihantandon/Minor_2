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

func (r *QuestionRepository) FindAll(limit int, offset int) ([]entity.QnA, error) {
	var questions []entity.QnA
	result := r.db.Limit(limit).Offset(offset).Find(&questions)
	if result.Error != nil {
		return nil, result.Error
	}
	return questions, nil
}

func (r *QuestionRepository) List(limit int) ([]entity.QnA, error) {
	var questions []entity.QnA

	// Order by RANDOM() to get a shuffled mix of difficulties
	err := r.db.Order("RANDOM()").Limit(limit).Find(&questions).Error

	return questions, err
}
