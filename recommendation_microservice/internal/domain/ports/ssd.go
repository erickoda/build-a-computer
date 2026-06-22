package ports

import (
	"context"

	"github.com/erickoda/build-a-computer/recommendation_microservice/internal/domain/models"
)

// SSDRepository defines the interface for the SSD repository.
type SSDRepository interface {
	FindByMinimumAmount(ctx context.Context, amount int32) ([]models.SSD, error)
}
