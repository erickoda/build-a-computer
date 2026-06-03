package ports

import (
	"context"
	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
)

type MotherBoardRepository interface {
	FindBySocketAndPCIEAndDDR(
		ctx context.Context, 
		socket string, 
		pcie int32, 
		ddr string,
	) ([]models.MotherBoard, error)
}