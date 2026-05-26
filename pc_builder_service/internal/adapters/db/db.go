package db

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
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

type DB struct {
	db *gorm.DB
}

func (bd *DB) New_data_base() error {
	gorm_config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		SkipDefaultTransaction: true,
		PrepareStmt: true,
	}

	dns, err := load_DB_config()
	if err != nil {
		return fmt.Errorf("failed to load DB config: %w", err)
	}

	db, err := gorm.Open(postgres.Open(dns), gorm_config)
	if err != nil{
		return  fmt.Errorf("failed to connect to database: %w", err)
	}

	bd.db = db
	return nil
}

func (db *DB) Close() {
	sqlDB, err := db.db.DB()
	if err != nil {
		return
	}
	sqlDB.Close()
}

func load_DB_config() (string, error) {
	err := godotenv.Load()
	if err != nil {
		return "", fmt.Errorf("failed to load .env file: %w", err)
	}
	
	port, _ := strconv.Atoi(os.Getenv("PGPORT"))
	host := os.Getenv("PGHOST")
	username := os.Getenv("PGUSER")
	password := os.Getenv("PGPASSWORD")
	db_name := os.Getenv("PGDATABASE")
	ssl_mode := os.Getenv("PGSSLMODE")
	
	config := DB_config{
		Host:     host,
		Port:     int32(port),
		Username: username,
		Password: password,
		DB_name:  db_name,
		SSL_mode: ssl_mode,
	}

	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		config.Host, 
		config.Port, 
		config.Username, 
		config.Password, 
		config.DB_name, 
		config.SSL_mode,
	), nil
}