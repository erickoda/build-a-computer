package ports

import (
	"context"
	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
)

type MotherBoardRepository interface {
	FindBySocketAndDDR(
		ctx context.Context, 
		socket string, 
		ddr string,
	) ([]models.MotherBoard, error)
}