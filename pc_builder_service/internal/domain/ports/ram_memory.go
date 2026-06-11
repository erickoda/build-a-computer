package ports

import (
	"context"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"github.com/google/uuid"
)

// RAMMemoryRepository defines the interface for the RAM memory repository.
type RAMMemoryRepository interface {
	FindByID(ctx context.Context, id uuid.UUID) (*models.RamMemory, error)
}