package db

import (
	"context"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"gorm.io/gorm"
)

type SSDRepositoryImpl struct {
	DB *gorm.DB
}

func NewSSDRepository(db *gorm.DB) *SSDRepositoryImpl {
	return &SSDRepositoryImpl{DB: db}
}

func (r *SSDRepositoryImpl) FindByMinimumAmount(ctx context.Context, amount int32) ([]models.SSD, error) {
	var ssds []models.SSD
	
	err := r.DB.WithContext(ctx).Model(&models.SSD{}).Where("amount >= ?", amount).Find(&ssds).Error
	if err != nil {
		err = HandleError(err)
		return nil, err
	}
	
	return ssds, nil
}
