package db

import (
	"fmt"
	"os"
	"strconv"

	
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"github.com/erickoda/build-a-computer/recommendation_microservice/internal/domain/models"

	_ "embed"
)

type DBConfig struct {
	Host     string
	Port     int32
	Username string
	Password string
	DBName   string
	SSLMode  string
}

type DB struct {
	Gorm *gorm.DB
}

func NewDataBase() (*DB, error) {
	gorm_config := &gorm.Config{
		Logger:                 logger.Default.LogMode(logger.Info),
		SkipDefaultTransaction: true,
		PrepareStmt:            true,
	}

	dns := loadDBConfig()

	db, err := gorm.Open(postgres.Open(dns), gorm_config)
	if err != nil {
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

func Migrate(db *DB) error {
	err := db.Gorm.AutoMigrate(
		&models.CPU{},
		&models.GPU{},
		&models.RamMemory{},
		&models.Game{},
		&models.Benchmark{},
		&models.MotherBoard{},
		&models.PowerSource{},
		&models.SSD{},
	)
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	return nil
}

func ExecOperationBeforeMigration(db *DB) error {
	enumsCreateSQL := `
		DO $$ 
		BEGIN 
			IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'performance') THEN 
				CREATE TYPE performance AS ENUM ('low', 'medium', 'high', 'ultra'); 
			END IF;

			IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'psu_ranking') THEN 
				CREATE TYPE psu_ranking AS ENUM ('white', 'bronze', 'silver', 'gold', 'platinum', 'titanium'); 
			END IF;

			IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ssd_type') THEN 
				CREATE TYPE ssd_type AS ENUM ('SATA', 'M2 SATA', 'M2 NVMe'); 
			END IF;
		END $$;`

	if err := db.Gorm.Exec(enumsCreateSQL).Error; err != nil {
		return fmt.Errorf("failed to create enums: %w", err)
	}

	return nil
}

func (db *DB) Get() *gorm.DB {
	return db.Gorm
}

func loadDBConfig() string {

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
	)
}
