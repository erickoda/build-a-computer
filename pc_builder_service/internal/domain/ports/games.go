package ports

import (
	"context"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"github.com/google/uuid"
)

// GameRepository defines the interface for the game repository.
type GameRepository interface {
	FindByID(ctx context.Context, id uuid.UUID) (*models.Game, error)	
}
