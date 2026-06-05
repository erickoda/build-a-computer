package ports

import (
	"context"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
)

type PowerSourcePort interface {
	FindByRecommendedPowerSource(
		ctx context.Context,
		recommendedPowerSource []int32,
	) ([]models.PowerSource, error)
}
