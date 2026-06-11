package ports

import (
	"context"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
)

// PowerSourceRepository defines the interface for the power source repository.
type PowerSourceRepository interface {
	FindByRecommendedPowerSource(
		ctx context.Context,
		recommendedPowerSource []int32,
	) ([]models.PowerSource, error)
}
