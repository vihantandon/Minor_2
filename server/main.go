package main

import (
	"olympiad/app/boot"
	"olympiad/app/router"

	"github.com/spf13/viper"
)

func main() {
	sugar := boot.Initialize_App()
	db := boot.InitializeDB(sugar)
	rdb := boot.InitializeRedis(sugar)
	r := router.SetupRoutes(db, rdb, sugar)
	r.Run(":" + viper.GetString("server.port"))
}
