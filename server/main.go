package main

import (
	"flag"
	"olympiad/app/boot"
	"olympiad/app/router"
	"olympiad/app/seeder"

	"github.com/spf13/viper"
)

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

	r := router.SetupRoutes(db, rdb, sugar)
	r.Run(":" + viper.GetString("server.port"))
}
