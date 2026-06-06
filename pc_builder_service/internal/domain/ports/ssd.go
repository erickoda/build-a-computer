package ports

import (
	"context"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
)

type SSDRepository interface {
	FindByMinimumAmount(ctx context.Context, amount int32) ([]models.SSD, error)
}
