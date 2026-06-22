package ports

import (
	"context"

	"github.com/erickoda/build-a-computer/recommendation_microservice/internal/domain/models"
	"github.com/google/uuid"
)

// GPURepository defines the interface for the GPU repository.
type GPURepository interface {
	FindByID(ctx context.Context, id uuid.UUID) (*models.GPU, error)
}