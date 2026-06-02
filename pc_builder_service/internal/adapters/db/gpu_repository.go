package db

import (
	"context"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type GPURepositoryImpl struct {
	DB *gorm.DB
}

func NewGPURepository(db *gorm.DB) *GPURepositoryImpl {
	return &GPURepositoryImpl{DB: db}
}

func (r *GPURepositoryImpl) FindByID(ctx context.Context, id uuid.UUID) (*models.GPU, error) {
	var gpu models.GPU

	result := r.DB.First(&gpu, id)
	if result.Error != nil {
		err := HandleError(result.Error)
		return nil, err
	}

	return &gpu, nil
}