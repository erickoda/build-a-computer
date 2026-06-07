package db

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	_ "embed"
)

type DBConfig struct {
	Host     string
	Port     int32
	Username string
	Password string
	DBName   string
	SSLMode string
}

type DB struct {
	Gorm *gorm.DB
}

func NewDataBase() (*DB, error) {
	gorm_config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		SkipDefaultTransaction: true,
		PrepareStmt: true,
	}

	dns, err := loadDBConfig()
	if err != nil {
		return nil, fmt.Errorf("failed to load DB config: %w", err)
	}

	db, err := gorm.Open(postgres.Open(dns), gorm_config)
	if err != nil{
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	return &DB{Gorm: db}, nil
}

func (db *DB) Close() {
	sqlDB, err := db.Gorm.DB()
	if err != nil {
		return
	}
	sqlDB.Close()
}

func (db *DB) Get() *gorm.DB {
	return db.Gorm
}

func loadDBConfig() (string, error) {
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
	
	config := DBConfig{
		Host:     host,
		Port:     int32(port),
		Username: username,
		Password: password,
		DBName:   db_name,
		SSLMode:  ssl_mode,
	}

	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		config.Host, 
		config.Port, 
		config.Username, 
		config.Password, 
		config.DBName, 
		config.SSLMode,
	), nil
}