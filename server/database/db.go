package database

import (
	"context"
	"log"
	"os"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

func GetDB() (*pgxpool.Pool, error) {
	var dbPool *pgxpool.Pool
	var once sync.Once
	once.Do(func() {
		poolConfig, err := pgxpool.ParseConfig(os.Getenv("DATABASE_URL"))
		if err != nil {
			log.Fatal(err)
		}
		poolConfig.MinConns = int32(0)
		poolConfig.MaxConns = int32(100) // Set the maximum number of connections in the pool
		poolConfig.MaxConnIdleTime = time.Second * 5
		dbPool, err = pgxpool.NewWithConfig(context.Background(), poolConfig)
		if err != nil {
			log.Fatal(err)
		}
	})
	return dbPool, nil
}
