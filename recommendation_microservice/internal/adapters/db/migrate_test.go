package db

/* 
import (
	"testing"

	"github.com/erickoda/build-a-computer/recommendation_microservice/internal/domain/models"
)

func TestRunMigrate(t *testing.T) {
	db, err := NewDataBase()
	if err != nil {
		t.Fatalf("failed to run migrate: %v", err)
	}

	defer db.Close()

	err := db.DB.AutoMigrate(
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
		t.Fatalf("failed to migrate: %v", err)
	}

	if !db.DB.Migrator().HasTable(&models.Benchmark{}) {
		t.Fatalf("failed to migrate: %v", err)
	}
	} */
