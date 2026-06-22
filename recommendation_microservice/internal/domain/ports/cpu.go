package ports

import (
	"context"
	
	"github.com/erickoda/build-a-computer/recommendation_microservice/internal/domain/models"
	"github.com/google/uuid"
)

// CPURepository defines the interface for the CPU repository.
type CPURepository interface {
	FindByID(ctx context.Context, id uuid.UUID) (*models.CPU, error)
}
