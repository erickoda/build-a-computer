package ports

import (
	"context"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
)

type RAMMemory interface {
	FindByID(ctx context.Context, id int32) (*models.RamMemory, error)
}