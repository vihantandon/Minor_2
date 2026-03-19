package repository

import (
	"errors"
	"olympiad/app/entity"

	"gorm.io/gorm"
)

type ContestRepository struct {
	db *gorm.DB
}

func NewContestRepository(db *gorm.DB) *ContestRepository {
	return &ContestRepository{db: db}
}

func (r *ContestRepository) Create(contest *entity.Contest) error {
	return r.db.Create(contest).Error
}

func (r *ContestRepository) FindByID(id uint) (*entity.Contest, error) {
	var contest entity.Contest
	result := r.db.
		Preload("Questions").
		Preload("Questions.Question").
		First(&contest, id)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &contest, result.Error
}

func (r *ContestRepository) FindAll() ([]entity.Contest, error) {
	var contests []entity.Contest
	result := r.db.Order("starts_at desc").Find(&contests)
	return contests, result.Error
}

func (r *ContestRepository) AddQuestion(cq *entity.ContestQuestion) error {
	return r.db.Create(cq).Error
}

func (r *ContestRepository) UpdateStatus(id uint, status entity.ContestStatus) error {
	return r.db.Model(&entity.Contest{}).
		Where("id = ?", id).
		Update("status", status).Error
}
