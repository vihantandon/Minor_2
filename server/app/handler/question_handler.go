package handler

import (
	"net/http"
	"olympiad/app/repository"
	"strconv"

	"github.com/gin-gonic/gin"
)

type QuestionHandler struct {
	questionRepo *repository.QuestionRepository
}

func NewQuestionHandler(repo *repository.QuestionRepository) *QuestionHandler {
	return &QuestionHandler{questionRepo: repo}
}

func (h *QuestionHandler) List(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	questions, err := h.questionRepo.FindAll(limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch practice questions"})
		return
	}

	c.JSON(http.StatusOK, questions)
}
