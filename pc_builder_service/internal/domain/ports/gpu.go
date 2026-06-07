package ports

import (
	"context"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"github.com/google/uuid"
)

type GPURepository interface {
	FindByID(ctx context.Context, id uuid.UUID) (*models.GPU, error)
}