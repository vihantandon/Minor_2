package repository

import (
	"errors"
	"olympiad/app/entity"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

// Create a new user
func (r *UserRepository) CreateUser(user *entity.User) error {
	result := r.db.Create(user)
	return result.Error
}

// Find by username
func (r *UserRepository) FindByUsername(username string) (*entity.User, error) {
	var user entity.User
	result := r.db.Where("username = ?", username).First(&user)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &user, result.Error
}

// Find by Email
func (r *UserRepository) FindByEmail(email string) (*entity.User, error) {
	var user entity.User
	result := r.db.Where("email = ?", email).First(&user)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &user, result.Error
}
