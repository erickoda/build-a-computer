package db

import (
	"fmt"
	"os"
	"strconv"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type DB_config struct {
	Host     string
	Port     int32
	Username string
	Password string
	DB_name   string
	SSL_mode string
}

func new_data_base() (*gorm.DB, error) {
	gorm_config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		SkipDefaultTransaction: true,
		PrepareStmt: true,
	}

	db, err := gorm.Open(postgres.Open(load_DB_config()), gorm_config)
	if err != nil{
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	return db, nil
}

func load_DB_config() string {
	port, _ := strconv.Atoi(os.Getenv("PGPORT"))
	
	config := DB_config{
		Host:     os.Getenv("PGHOST"),
		Port:     int32(port),
		Username: os.Getenv("PGUSER"),
		Password: os.Getenv("PGPASSWORD"),
		DB_name:  os.Getenv("PGDATABASE"),
		SSL_mode: os.Getenv("PGSSLMODE"),
	}

	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		config.Host, config.Port, config.Username, config.Password, config.DB_name, config.SSL_mode)
}