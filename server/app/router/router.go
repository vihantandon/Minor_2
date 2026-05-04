package router

import (
	"olympiad/app/handler"
	"olympiad/app/middleware"
	"olympiad/app/repository"
	"olympiad/app/service"
	"time"

	"github.com/gin-contrib/cors"
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
	contestRepo := repository.NewContestRepository(db)
	submissionRepo := repository.NewSubmissionRepository(db)

	// Services
	userService := service.NewUserService(userRepo)
	contestService := service.NewContestService(contestRepo, questionRepo, rdb)
	submissionService := service.NewSubmissionService(submissionRepo, contestRepo, questionRepo)

	// Handlers
	userHandler := handler.NewUserHandler(userService, userRepo)
	contestHandler := handler.NewContestHandler(contestService)
	questionHandler := handler.NewQuestionHandler(questionRepo)
	submissionHandler := handler.NewSubmissionHandler(submissionService, userRepo)

	api := r.Group("/api")

	// Auth (public)
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

	// Protected contest routes (JWT required)
	contestsAuth := api.Group("/contests")
	contestsAuth.Use(middleware.AuthRequired())
	{
		contestsAuth.POST("/:id/submit", submissionHandler.Submit)
	}

	// User routes (JWT required)
	users := api.Group("/users")
	users.Use(middleware.AuthRequired())
	{
		users.GET("/me", submissionHandler.Me)
	}

	// Questions (public)
	questions := api.Group("/questions")
	{
		questions.GET("", questionHandler.List)
	}

	// Admin routes (JWT + admin role)
	admin := api.Group("/admin")
	admin.Use(middleware.AuthRequired(), middleware.AdminOnly())
	{
		admin.POST("/contests", contestHandler.Create)
		admin.POST("/contests/:id/questions", contestHandler.AssignQuestions)
	}

	sugar.Infof("Router initialized")
	return r
}
