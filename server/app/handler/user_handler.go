package handler

import (
	"olympiad/app/repository"
	"olympiad/app/service"
)

type UserHandler struct {
	userService *service.UserService
	userRepo    *repository.UserRepository
}

func NewUserHandler(svc *service.UserService, repo *repository.UserRepository) *UserHandler {
	return &UserHandler{
		userService: svc,
		userRepo:    repo,
	}
}

// POST /api.auth.register
