package services

import (
	"context"
	"time"

	repoitory "github.com/erickoda/build-a-computer/pc_builder_service/internal/adapters/db"
	model "github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/ports"
)

type BuilderService struct {
	BenchmarkRepo repoitory.BenchmarkRepository
}

func NewBuilderService(benchmarkRepo repoitory.BenchmarkRepository) ports.BuilderPort {
	return &BuilderService{
		BenchmarkRepo: benchmarkRepo,
	}
}

func (s *BuilderService) GetBenchmarksByHavierGame(
	ctx context.Context, 
	games []string, 
	resolution int32,
) ([]model.Benchmark, error) {
		
	games_parsed, err := model.Parse_ID(games...)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	
	benchmarks, err := s.BenchmarkRepo.FindBenchmarksByHavierGame(ctx, games_parsed, resolution)
	if err != nil {
		return nil, err
	}
	
	return benchmarks, nil
}

func (s *BuilderService) GetBenchmarkByBestScore(
	ctx context.Context, 
	benchmarks []model.Benchmark,
) ([]model.Benchmark, error) {
	return nil, nil
}

func (s *BuilderService) GetMotherBoardBySocketAndPCIEAndDDRAndPrice(
	ctx context.Context,
	socket string,
	pcie string,
	ddr string,
	price float32,
) ([]model.MotherBoard, error) {
	return nil, nil
}

