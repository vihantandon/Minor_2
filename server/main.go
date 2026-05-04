package main

import (
	"flag"
	"olympiad/app/boot"
	"olympiad/app/entity"
	"olympiad/app/repository"
	"olympiad/app/router"
	"olympiad/app/seeder"
	"olympiad/app/service"
	"time"

	"github.com/spf13/viper"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

func runSchedulers(
	db *gorm.DB,
	contestService *service.ContestService,
	ratingService *service.RatingService,
	sugar *zap.SugaredLogger,
) {
	// Tick every minute: update contest statuses + cache upcoming contests
	contestTicker := time.NewTicker(1 * time.Minute)
	go func() {
		for range contestTicker.C {
			if err := contestService.UpdateContestStatuses(); err != nil {
				sugar.Errorf("scheduler: UpdateContestStatuses: %v", err)
			}
			if err := contestService.CacheUpcomingContests(); err != nil {
				sugar.Errorf("scheduler: CacheUpcomingContests: %v", err)
			}
		}
	}()

	// Tick every 15 minutes: recalculate ratings for all live contests
	ratingTicker := time.NewTicker(15 * time.Minute)
	go func() {
		for range ratingTicker.C {
			if err := ratingService.ProcessLiveContests(); err != nil {
				sugar.Errorf("scheduler: ProcessLiveContests: %v", err)
			}
		}
	}()
}

func main() {
	seed := flag.Bool("seed", false, "Seed the database from dataset.csv")
	flag.Parse()

	sugar := boot.Initialize_App()
	db := boot.InitializeDB(sugar)
	rdb := boot.InitializeRedis(sugar)

	if *seed {
		if err := seeder.SeedQuestions(db, sugar, "app/dataset.csv"); err != nil {
			sugar.Fatalf("Seeding failed: %v", err)
		}
	}

	// Repos
	contestRepo := repository.NewContestRepository(db)
	questionRepo := repository.NewQuestionRepository(db)
	userRepo := repository.NewUserRepository(db)
	submissionRepo := repository.NewSubmissionRepository(db)

	// Services
	contestService := service.NewContestService(contestRepo, questionRepo, rdb)
	ratingService := service.NewRatingService(submissionRepo, userRepo, contestRepo, rdb, sugar)

	// Sync contest statuses immediately on boot — don't wait for first scheduler tick
	if err := contestService.UpdateContestStatuses(); err != nil {
		sugar.Errorf("boot: UpdateContestStatuses: %v", err)
	}
	sugar.Infof("boot: contest statuses synced")

	// AutoMigrate the updated Submission entity
	if err := db.AutoMigrate(&entity.Submission{}); err != nil {
		sugar.Fatalf("boot: AutoMigrate Submission failed: %v", err)
	}

	runSchedulers(db, contestService, ratingService, sugar)

	r := router.SetupRoutes(db, rdb, sugar)
	r.Run(":" + viper.GetString("server.port"))
}
