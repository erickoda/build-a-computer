package db

import (
	"context"

	"github.com/erickoda/build-a-computer/recommendation_microservice/internal/domain/models"
	"github.com/google/uuid"
)

type GPURepositoryImpl struct {
	DB *DB
}

func NewGPURepositoryImpl(db *DB) *GPURepositoryImpl {
	return &GPURepositoryImpl{DB: db}
}

func (r *GPURepositoryImpl) FindByID(ctx context.Context, id uuid.UUID) (*models.GPU, error) {
	var gpu models.GPU

	result := r.DB.Gorm.WithContext(ctx).First(&gpu, id)
	if result.Error != nil {
		err := HandleError(result.Error, "gpu")
		return nil, err
	}

	return &gpu, nil
}