package db

import (
	"context"

	"gorm.io/gorm"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
)

type MotherBoardRepositoryImpl struct {
	DB *gorm.DB
}

func NewMotherBoardRepository(db *gorm.DB) *MotherBoardRepositoryImpl {
	return &MotherBoardRepositoryImpl{DB: db}
}

func (r *MotherBoardRepositoryImpl) FindBySocketAndPCIEAndDDR(
		ctx context.Context, 
		socket string, 
		pcie int32, 
		ddr string,
) ([]models.MotherBoard, error) {
	var motherBoards []models.MotherBoard

	result := r.DB.WithContext(ctx).
		Where("socket = ?", socket).
		Where("pcie = ?", pcie).
		Where("ddr = ?", ddr).
		Find(&motherBoards)
	if result.Error != nil {
		err := HandleError(result.Error)
		return nil, err
	}
	
	return motherBoards, nil
}
