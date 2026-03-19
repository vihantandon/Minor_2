package router

import (
	"olympiad/app/handler"
	"olympiad/app/middleware"
	"olympiad/app/repository"
	"olympiad/app/service"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SetupRoutes(db *gorm.DB, rdb *redis.Client, sugar *zap.SugaredLogger) *gin.Engine {
	r := gin.Default()

	// Repos
	userRepo := repository.NewUserRepository(db)
	questionRepo := repository.NewQuestionRepository(db)
	contestRepo := repository.NewContestRepository(db)

	// Services
	userService := service.NewUserService(userRepo)
	contestService := service.NewContestService(contestRepo, questionRepo)

	// Handlers
	userHandler := handler.NewUserHandler(userService, userRepo)
	contestHandler := handler.NewContestHandler(contestService)

	api := r.Group("/api")

	// Auth routes (public)
	auth := api.Group("/auth")
	{
		auth.POST("/register", userHandler.Register)
		auth.POST("/login", userHandler.Login)
	}

	// Public contest routes
	contests := api.Group("/contests")
	{
		contests.GET("", contestHandler.List)
		contests.GET("/:id", contestHandler.Get)
	}

	// Admin routes (JWT + admin role required)
	admin := api.Group("/admin")
	admin.Use(middleware.AuthRequired(), middleware.AdminOnly())
	{
		admin.POST("/contests", contestHandler.Create)
		admin.POST("/contests/:id/questions", contestHandler.AssignQuestions)
	}

	sugar.Infof("Router initialized")
	return r
}
