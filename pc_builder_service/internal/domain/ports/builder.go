package ports

import (
	"context"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"github.com/google/uuid"
)

// BuilderPort defines the interface for the builder service.
type BuilderPort interface {
	GetCPUsByID(
		ctx context.Context, 
		benchmarks []models.Benchmark,
	) (map[uuid.UUID]models.CPU, error)
	
	GetGPUsByID(
		ctx context.Context,
		benchmarks []models.Benchmark,
	) (map[uuid.UUID]models.GPU, error)
	
	GetRAMsByID(
		ctx context.Context,
		benchmarks []models.Benchmark,
	) (map[uuid.UUID]models.RamMemory, error)

	GetGameByID(
		ctx context.Context,
		gamesIDs []string,
	) ([]models.Game, error)
	
	GetBenchmarksByHavierGame(ctx context.Context, games []string, resolution int32) ([]models.Benchmark, error)
	
	GetBenchmarksByBestScore(
		ctx context.Context, 
		benchmarks []models.Benchmark,
		performance string,
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
		performance string,
	) (map[uuid.UUID]models.MotherBoard, error)

	GetBenchmarksSockets(ctx context.Context, benchmarks []models.Benchmark) ([]string, error)
	GetBenchmarksDDRs(ctx context.Context, benchmarks []models.Benchmark) ([]string, error)

	GetPowerSourcesByRecommendedPower(
		ctx context.Context,
		selectedBenchmarks []models.Benchmark,
	) (map[uuid.UUID][]models.PowerSource, error)

	GetPowerSourcesByScore(
		ctx context.Context,
		powerSourcesMappedByBenchmark map[uuid.UUID][]models.PowerSource,
	) (map[uuid.UUID]models.PowerSource, error)

	GetSSDByMinimumNecessaryAmount(
		ctx context.Context,
		games []models.Game,
		benchmarks []models.Benchmark,
	) (map[uuid.UUID][]models.SSD, error)

	GetSSDByScore(
		ctx context.Context,
		ssdsMappedByBenchmark map[uuid.UUID][]models.SSD,
		performance string,
	) (map[uuid.UUID]models.SSD, error)

	CreatePCs(
		cpu map[uuid.UUID]models.CPU,
		gpu map[uuid.UUID]models.GPU,
		ram map[uuid.UUID]models.RamMemory,
		motherBoard map[uuid.UUID]models.MotherBoard,
		powerSource map[uuid.UUID]models.PowerSource,
		ssd map[uuid.UUID]models.SSD,
	) []models.PC

	CheckIfPCCostsMoreThanRequested(
		pc models.PC,
		requestedPrice float32,
	) bool
}
