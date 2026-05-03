package router

import (
	"olympiad/app/handler"
	"olympiad/app/middleware"
	"olympiad/app/repository"
	"olympiad/app/service"
	"time" // Needed for the MaxAge config

	"github.com/gin-contrib/cors" // Added CORS import
	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SetupRoutes(db *gorm.DB, rdb *redis.Client, sugar *zap.SugaredLogger) *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Repos
	userRepo := repository.NewUserRepository(db)
	questionRepo := repository.NewQuestionRepository(db)
	questionHandler := handler.NewQuestionHandler(questionRepo)
	contestRepo := repository.NewContestRepository(db)

	// Services
	userService := service.NewUserService(userRepo)
	contestService := service.NewContestService(contestRepo, questionRepo, rdb)

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

	questions := api.Group("/questions")
	{
		questions.GET("", questionHandler.List)
	}

	sugar.Infof("Router initialized")
	return r
}
