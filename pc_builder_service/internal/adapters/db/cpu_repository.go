package db

import (
	"context"

	"github.com/google/uuid"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
)

type CPURepositoryImpl struct {
	DB *DB
}

func NewCPURepositoryImpl(db *DB) *CPURepositoryImpl {
	return &CPURepositoryImpl{DB: db}
}

func (r *CPURepositoryImpl) FindByID(ctx context.Context, id uuid.UUID) (*models.CPU, error) {
	var cpu models.CPU

	result := r.DB.Gorm.WithContext(ctx).First(&cpu, id)
	if result.Error != nil {
		err := HandleError(result.Error)
		return nil, err
	}
	return &cpu, nil
}
