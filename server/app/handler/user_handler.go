package handler

import (
	"errors"
	"net/http"
	"olympiad/app/dto"
	"olympiad/app/repository"
	"olympiad/app/service"

	"github.com/gin-gonic/gin"
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
func (h *UserHandler) Register(c *gin.Context) {
	var req *dto.RegisterRequest //creates empty container
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.userService.Register(req)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrEmailTaken):
			c.JSON(http.StatusConflict, gin.H{"error": "Email already taken"})

		case errors.Is(err, service.ErrUsernameTaken):
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "registration failed"})
			return
		}

		c.JSON(http.StatusCreated, resp)
	}
}

// POST /api/auth/login

func (h *UserHandler) Login(c *gin.Context) {
	var req *dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.userService.Login(req)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCred) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Login failed"})
		return
	}

	c.JSON(http.StatusOK, resp)
}
