package router

import (
	"olympiad/app/handler"
	"olympiad/app/middleware"
	"olympiad/app/repository"
	"olympiad/app/service"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func SetupRoutes(db *gorm.DB, sugar *zap.SugaredLogger) *gin.Engine {
	r := gin.Default()

	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService, userRepo)

	api := r.Group("/api")

	// Auth routes

	auth := api.Group("/auth")
	{
		auth.POST("/register", userHandler.Register) // ceates account

		auth.POST("/login", userHandler.Login) // Login user

	}

	// Admin routes

	admin := api.Group("/admin")
	admin.Use(middleware.AuthRequired(), middleware.AdminOnly())

	{
		// admin.POST("/questions", questionHandler.Create) fir future use
	}

	sugar.Infof("Router initialized")

	return r

}
