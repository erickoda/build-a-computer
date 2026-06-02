package db

import (
	"context"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type RAMMemoryRepositoryImpl struct {
	DB *gorm.DB
}

func NewRAMMemoryRepository(db *gorm.DB) *RAMMemoryRepositoryImpl {
	return &RAMMemoryRepositoryImpl{DB: db}
}

func (r *RAMMemoryRepositoryImpl) FindByID(ctx context.Context, id uuid.UUID) (*models.RamMemory, error) {
	var ram models.RamMemory
	
	result := r.DB.First(&ram, id)
	if result.Error != nil {
		err := HandleError(result.Error)
		return nil, err
	}
	
	return &ram, nil
}