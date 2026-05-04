package handler

import (
	"errors"
	"net/http"
	"olympiad/app/dto"
	"olympiad/app/middleware"
	"olympiad/app/repository"
	"olympiad/app/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

type SubmissionHandler struct {
	submissionService *service.SubmissionService
	userRepo          *repository.UserRepository
}

func NewSubmissionHandler(svc *service.SubmissionService, userRepo *repository.UserRepository) *SubmissionHandler {
	return &SubmissionHandler{submissionService: svc, userRepo: userRepo}
}

// POST /api/contests/:id/submit
func (h *SubmissionHandler) Submit(c *gin.Context) {
	contestID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid contest id"})
		return
	}

	var req dto.SubmitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetUint(middleware.UserIDKey)

	resp, err := h.submissionService.Submit(&req, uint(contestID), userID)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrContestNotActive):
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
		case errors.Is(err, service.ErrQuestionNotInContest):
			c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		case errors.Is(err, service.ErrQuestionNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "submission failed"})
		}
		return
	}

	c.JSON(http.StatusCreated, resp)
}

// GET /api/users/me
func (h *SubmissionHandler) Me(c *gin.Context) {
	userID := c.GetUint(middleware.UserIDKey)

	user, err := h.userRepo.FindByID(userID)
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, dto.UserMeResponse{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     int(user.Role),
		Score:    user.Score,
	})
}
