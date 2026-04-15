package main

import (
	"flag"
	"olympiad/app/boot"
	"olympiad/app/repository"
	"olympiad/app/router"
	"olympiad/app/seeder"
	"olympiad/app/service"
	"time"

	"github.com/spf13/viper"
	"go.uber.org/zap"
)

func runScheduler(contestService *service.ContestService, sugar *zap.SugaredLogger) {
	ticker := time.NewTicker(1 * time.Minute)
	go func() {
		for range ticker.C {
			if err := contestService.UpdateContestStatuses(); err != nil {
				sugar.Errorf("Failed to update contest statuses: %v", err)
			}

			if err := contestService.CacheUpcomingContests(); err != nil {
				sugar.Errorf("Failed to cache upcoming contests: %v", err)
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

	contestRepo := repository.NewContestRepository(db)
	questionRepo := repository.NewQuestionRepository(db)
	contestService := service.NewContestService(contestRepo, questionRepo, rdb)

	runScheduler(contestService, sugar)

	r := router.SetupRoutes(db, rdb, sugar)
	r.Run(":" + viper.GetString("server.port"))
}
