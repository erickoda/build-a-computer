package db

import (
	"context"

	"github.com/erickoda/build-a-computer/recommendation_microservice/internal/domain/models"
	"github.com/google/uuid"
)

type GameRepositoryImpl struct {
	DB *DB
}

func NewGameRepositoryImpl(db *DB) *GameRepositoryImpl {
	return &GameRepositoryImpl{DB: db}
}

func (r *GameRepositoryImpl) FindByID(ctx context.Context, id uuid.UUID) (*models.Game, error) {
	var game models.Game
	
	if err := r.DB.Gorm.WithContext(ctx).First(&game, id).Error; err != nil {
		return nil, HandleError(err, "game")
	}
	
	return &game, nil
}
