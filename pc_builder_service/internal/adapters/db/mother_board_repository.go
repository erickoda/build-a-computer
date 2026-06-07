package db

import (
	"context"

	"gorm.io/gorm"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
)

type MotherBoardRepositoryImpl struct {
	DB *gorm.DB
}

func NewMotherBoardRepositoryImpl(db *gorm.DB) *MotherBoardRepositoryImpl {
	return &MotherBoardRepositoryImpl{DB: db}
}

func (r *MotherBoardRepositoryImpl) FindBySocketAndDDR(
		ctx context.Context, 
		socket string, 
		ddr string,
) ([]models.MotherBoard, error) {
	var motherBoards []models.MotherBoard

	result := r.DB.WithContext(ctx).
		Model(&models.MotherBoard{}).
		Where("socket = ?", socket).
		Where("ddr = ?", ddr).
		Find(&motherBoards)
	if result.Error != nil {
		err := HandleError(result.Error)
		return nil, err
	}
	
	return motherBoards, nil
}
