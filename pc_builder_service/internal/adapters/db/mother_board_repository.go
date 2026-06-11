package db

import (
	"context"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
)

type MotherBoardRepositoryImpl struct {
	DB *DB
}

func NewMotherBoardRepositoryImpl(db *DB) *MotherBoardRepositoryImpl {
	return &MotherBoardRepositoryImpl{DB: db}
}

func (r *MotherBoardRepositoryImpl) FindBySocketAndDDR(
	ctx context.Context,
	socket string,
	ddr string,
) ([]models.MotherBoard, error) {
	var motherBoards []models.MotherBoard

	result := r.DB.Gorm.WithContext(ctx).
		Model(&models.MotherBoard{}).
		Where("socket = ?", socket).
		Where("ddr = ?", ddr).
		Find(&motherBoards)
	if result.Error != nil {
		err := HandleError(result.Error, "mother_board")
		return nil, err
	}
	
	return motherBoards, nil
}
