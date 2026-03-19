package handler

import (
	"errors"
	"net/http"
	"olympiad/app/dto"
	"olympiad/app/middleware"
	"olympiad/app/service"
	"strconv"

	"github.com/gin-gonic/gin"
)

type ContestHandler struct {
	contestService *service.ContestService
}

func NewContestHandler(svc *service.ContestService) *ContestHandler {
	return &ContestHandler{contestService: svc}
}

// POST /api/admin/contests
func (h *ContestHandler) Create(c *gin.Context) {
	var req dto.CreateContestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	adminID := c.GetUint(middleware.UserIDKey)

	resp, err := h.contestService.CreateContest(&req, adminID)
	if err != nil {
		if errors.Is(err, service.ErrContestTimeInvalid) {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create contest"})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

// POST /api/admin/contests/:id/questions
func (h *ContestHandler) AssignQuestions(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid contest id"})
		return
	}

	var req dto.AssignQuestionsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.contestService.AssignQuestions(uint(id), &req)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrContestNotFound):
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		case errors.Is(err, service.ErrQuestionNotFound):
			c.JSON(http.StatusUnprocessableEntity, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to assign questions"})
		}
		return
	}

	c.JSON(http.StatusOK, resp)
}

// GET /api/contests
func (h *ContestHandler) List(c *gin.Context) {
	contests, err := h.contestService.ListContests()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list contests"})
		return
	}
	c.JSON(http.StatusOK, contests)
}

// GET /api/contests/:id
func (h *ContestHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid contest id"})
		return
	}

	contest, err := h.contestService.GetContest(uint(id))
	if err != nil {
		if errors.Is(err, service.ErrContestNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get contest"})
		return
	}

	c.JSON(http.StatusOK, contest)
}
