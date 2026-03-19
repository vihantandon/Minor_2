package boot

import (
	"context"

	"github.com/redis/go-redis/v9"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

func InitializeRedis(sugar *zap.SugaredLogger) *redis.Client {
	addr := viper.GetString("Redis.addr")

	client := redis.NewClient(&redis.Options{
		Addr: addr,
	})

	if err := client.Ping(context.Background()).Err(); err != nil {
		sugar.Fatalf("Failed to connect to Redis: %v", err)
	}

	sugar.Infof("Redis connected at %s", addr)
	return client
}
