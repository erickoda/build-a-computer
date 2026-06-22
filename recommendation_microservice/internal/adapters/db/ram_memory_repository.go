package db

import (
	"context"

	"github.com/erickoda/build-a-computer/recommendation_microservice/internal/domain/models"
	"github.com/google/uuid"
)

type RAMMemoryRepositoryImpl struct {
	DB *DB
}

func NewRAMMemoryRepositoryImpl(db *DB) *RAMMemoryRepositoryImpl {
	return &RAMMemoryRepositoryImpl{DB: db}
}

func (r *RAMMemoryRepositoryImpl) FindByID(ctx context.Context, id uuid.UUID) (*models.RamMemory, error) {
	var ram models.RamMemory
	
	result := r.DB.Gorm.WithContext(ctx).First(&ram, id)
	if result.Error != nil {
		err := HandleError(result.Error, "ram_memory")
		return nil, err
	}
	
	return &ram, nil
}