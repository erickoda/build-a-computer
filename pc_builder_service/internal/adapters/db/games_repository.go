package db

import (
	"context"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type GameRepositoryImpl struct {
	DB *gorm.DB
}

func NewGameRepositoryImpl(db *gorm.DB) *GameRepositoryImpl {
	return &GameRepositoryImpl{DB: db}
}

func (r *GameRepositoryImpl) FindByID(ctx context.Context, id uuid.UUID) (*models.Game, error) {
	var game models.Game
	
	if err := r.DB.WithContext(ctx).First(&game, id).Error; err != nil {
		return nil, HandleError(err)
	}
	
	return &game, nil
}
