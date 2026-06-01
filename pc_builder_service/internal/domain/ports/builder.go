package ports

import (
	"context"

	model "github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
)

type BuilderPort interface {
	GetBenchmarksByHavierGame(ctx context.Context, games []string, resolution int32) ([]model.Benchmark, error)
	GetBenchmarkByBestScore(ctx context.Context, benchmarks []model.Benchmark) ([]model.Benchmark, error)
	GetMotherBoardBySocketAndPCIEAndDDRAndPrice(
		ctx context.Context, 
		socket string, 
		pcie string, 
		ddr string, 
		price float32,
	) ([]model.MotherBoard, error)
}
