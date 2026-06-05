package ports

import (
	"context"

	e "github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/enums"
	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"github.com/google/uuid"
)

type BuilderPort interface {
	GetBenchmarksByHavierGame(ctx context.Context, games []string, resolution int32) ([]models.Benchmark, error)
	
	GetBenchmarksByBestScore(
		ctx context.Context, 
		benchmarks []models.Benchmark,
		requestedPerformance e.ComputerPerformance,
	) ([]models.Benchmark, error)

	GetMotherBoardBySocketAndDDR(
		ctx context.Context,
		socket []string,
		ddr []string,
		selectedBenchmarks []models.Benchmark,
	) (map[string]map[uuid.UUID][]models.MotherBoard, error)
	
	GetMotherBoardsByScore(
		ctx context.Context,
		motherBoardsMappedBySocketAndDDR map[string]map[uuid.UUID][]models.MotherBoard,
		requestedPerformance e.ComputerPerformance,
	) (map[uuid.UUID]models.MotherBoard, error)

	GetBenchmarksSockets(ctx context.Context, benchmarks []models.Benchmark) ([]string, error)
	GetBenchmarksPCIExpress(ctx context.Context, benchmarks []models.Benchmark) ([]int32, error)
	GetBenchmarksDDRs(ctx context.Context, benchmarks []models.Benchmark) ([]string, error)
}
