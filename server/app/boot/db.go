package boot

import (
	"fmt"
	"olympiad/app/entity"

	"github.com/spf13/viper"
	"go.uber.org/zap"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitializeDB(sugar *zap.SugaredLogger) *gorm.DB {
	host := viper.GetString("database.host")
	port := viper.GetInt("database.port")
	user := viper.GetString("database.user")
	password := viper.GetString("database.password")
	dbname := viper.GetString("database.name")

	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		sugar.Fatalf("Failed to connect to database: %v", err)
	}

	if err := db.AutoMigrate(
		&entity.User{},
		&entity.QnA{},
	); err != nil {
		sugar.Fatalf("AutoMigrate failed: %v", err)
	}

	sugar.Infof("Database connected and migrated")
	return db
}
