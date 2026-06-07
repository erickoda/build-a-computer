package db

import (
	"context"

	"gorm.io/gorm"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
)

type PowerSourceRepositoryImpl struct {
	DB *gorm.DB
}

func NewPowerSourceRepositoryImpl(db *gorm.DB) *PowerSourceRepositoryImpl {
	return &PowerSourceRepositoryImpl{DB: db}
}

func (r *PowerSourceRepositoryImpl) FindByRecommendedPowerSource(
		ctx context.Context,
		recommendedPowerSource []int32,
) ([]models.PowerSource, error) {
	
	var powerSources []models.PowerSource
	
	err := r.DB.WithContext(ctx).
		Model(&models.PowerSource{}).
		Where("power_amount IN ?", recommendedPowerSource).
		Find(&powerSources).
		Error
	if err != nil {
		err = HandleError(err)
		return nil, err
	}
	
	return powerSources, nil
}
