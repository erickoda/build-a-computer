package db

import (
	"context"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
)

type CPURepositoryImpl struct {
	DB *gorm.DB
}

func NewCPURepositoryImpl(db *gorm.DB) *CPURepositoryImpl {
	return &CPURepositoryImpl{DB: db}
}

func (r *CPURepositoryImpl) FindByID(ctx context.Context, id uuid.UUID) (*models.CPU, error) {
	var cpu models.CPU

	result := r.DB.WithContext(ctx).First(&cpu, id)
	if result.Error != nil {
		err := HandleError(result.Error)
		return nil, err
	}
	return &cpu, nil
}
