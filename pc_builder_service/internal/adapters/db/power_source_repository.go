package db

import (
	"context"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
)

type PowerSourceRepositoryImpl struct {
	DB *DB
}

func NewPowerSourceRepositoryImpl(db *DB) *PowerSourceRepositoryImpl {
	return &PowerSourceRepositoryImpl{DB: db}
}

func (r *PowerSourceRepositoryImpl) FindByRecommendedPowerSource(
		ctx context.Context,
		recommendedPowerSource []int32,
) ([]models.PowerSource, error) {
	
	var powerSources []models.PowerSource
	
	err := r.DB.Gorm.WithContext(ctx).
		Model(&models.PowerSource{}).
		Where("power_amount IN ?", recommendedPowerSource).
		Find(&powerSources).
		Error
	if err != nil {
		err = HandleError(err, "power_source")
		return nil, err
	}
	
	return powerSources, nil
}
