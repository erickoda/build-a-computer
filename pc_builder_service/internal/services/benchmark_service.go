package services

import (
	"cmp"
	"context"
	"math"
	"slices"
	"time"

	repository "github.com/erickoda/build-a-computer/pc_builder_service/internal/adapters/db"
	e "github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/enums"
	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	model "github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/ports"
)

type BuilderService struct {
	BenchmarkRepo repository.BenchmarkRepositoryImpl
	CPURepo repository.CPURepositoryImpl
	GPURepo repository.GPURepositoryImpl
	RAMRepo repository.RAMMemoryRepositoryImpl
}

func NewBuilderService(
	benchmarkRepoImpl repository.BenchmarkRepositoryImpl, 
	cpuRepoImpl repository.CPURepositoryImpl,
	gpuRepoImpl repository.GPURepositoryImpl,
	ramRepoImpl repository.RAMMemoryRepositoryImpl,
)  ports.BuilderPort {
	
	return &BuilderService{
		BenchmarkRepo: benchmarkRepoImpl,
		CPURepo: cpuRepoImpl,
		GPURepo: gpuRepoImpl,
		RAMRepo: ramRepoImpl,
	}
}

func (s *BuilderService) GetBenchmarksByHavierGame(
	ctx context.Context, 
	games []string, 
	resolution int32,
) ([]model.Benchmark, error) {
		
	gamesParsed, err := model.Parse_ID(games...)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	
	benchmarks, err := s.BenchmarkRepo.FindBenchmarksByHavierGame(ctx, gamesParsed, resolution)
	if err != nil {
		return nil, err
	}
	
	return benchmarks, nil
}

func (s *BuilderService) GetBenchmarksByBestScore(
	ctx context.Context, 
	benchmarks []model.Benchmark,
	requestedPerformance e.ComputerPerformance,
) ([]model.Benchmark, error) {

	const NUMBER_OF_SELECTED_BENCHMARKS = 1
	
	var performanceWeight int32
	var performanceQuartileFloor float64
	var performanceQuartileCeil float64
	var size = len(benchmarks)
	var selectedBenchmarks []models.Benchmark

	for i := range benchmarks {
		if benchmarks[i].Score > 0 {
			continue
		}
		
		switch benchmarks[i].ComputerPerformance {
		case e.ComputerPerformanceLow:
			performanceWeight = 1
			calculatedScore, err := calculatePerformanceScore(ctx, benchmarks[i], performanceWeight, s)
			if err != nil {
				return nil, err
			}
			
			benchmarks[i].Score = calculatedScore
			
		case e.ComputerPerformanceMedium:
			performanceWeight = 2
			calculatedScore, err := calculatePerformanceScore(ctx, benchmarks[i], performanceWeight, s)
			if err != nil {
				return nil, err
			}
			
			benchmarks[i].Score = calculatedScore
			
		case e.ComputerPerformanceHigh:
			performanceWeight = 3
			calculatedScore, err := calculatePerformanceScore(ctx, benchmarks[i], performanceWeight, s)
			if err != nil {
				return nil, err
			}
			
			benchmarks[i].Score = calculatedScore
			
		case e.ComputerPerformanceUltra:
			performanceWeight = 4
			calculatedScore, err := calculatePerformanceScore(ctx, benchmarks[i], performanceWeight, s)
			if err != nil {
				return nil, err
			}
			
			benchmarks[i].Score = calculatedScore
		}
	}

	slices.SortFunc(benchmarks, func(i, j model.Benchmark) int {
		 return cmp.Compare(i.Score, j.Score)
	})

	switch requestedPerformance {
	case e.ComputerPerformanceLow:
		performanceQuartileCeil = 0.30

		ceilIndex := (int(math.Floor(float64(size) * performanceQuartileCeil))) - 1
		benchmarks = benchmarks[:ceilIndex]

		selectedBenchmarks = benchmarks[:NUMBER_OF_SELECTED_BENCHMARKS]

		if len(benchmarks) < NUMBER_OF_SELECTED_BENCHMARKS {
			return benchmarks, nil
		}
		
	case e.ComputerPerformanceMedium:
		performanceQuartileFloor = 0.30
		performanceQuartileCeil = 0.60

		floorIndex := (int(math.Ceil(float64(size) * performanceQuartileFloor))) -1
		ceilIndex := (int(math.Floor(float64(size) * performanceQuartileCeil))) - 1
		
		benchmarks = benchmarks[floorIndex:ceilIndex]

		selectedBenchmarks = benchmarks[:NUMBER_OF_SELECTED_BENCHMARKS]

		if len(benchmarks) < NUMBER_OF_SELECTED_BENCHMARKS {
			return benchmarks, nil
		}
		
	case e.ComputerPerformanceHigh:
		performanceQuartileFloor = 0.60
		performanceQuartileCeil = 0.90

		floorIndex := int(math.Ceil(float64(size) * performanceQuartileFloor))
		ceilIndex := int(math.Floor(float64(size) * performanceQuartileCeil))
		
		benchmarks = benchmarks[floorIndex:ceilIndex]

		selectedBenchmarks = benchmarks[:NUMBER_OF_SELECTED_BENCHMARKS]

		if len(benchmarks) < NUMBER_OF_SELECTED_BENCHMARKS {
			return benchmarks, nil
		}
		
	case e.ComputerPerformanceUltra:
		performanceQuartileFloor = 0.90

		floorIndex := (int(math.Ceil(float64(size) * performanceQuartileFloor))) - 1
		benchmarks = benchmarks[floorIndex:]

		selectedBenchmarks = benchmarks[:NUMBER_OF_SELECTED_BENCHMARKS]
		
		if len(benchmarks) < NUMBER_OF_SELECTED_BENCHMARKS {
			return benchmarks, nil
		}
	}

	return selectedBenchmarks, nil
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

func calculatePerformanceScore(
	ctx context.Context,
	benchmark model.Benchmark,
	performanceWeight int32,
	s *BuilderService,
) (int32, error) {
	
	var score int32 = int32(benchmark.AvgFps) * performanceWeight
	ctx, cancel := context.WithTimeout(ctx, 500*time.Millisecond)
	defer cancel()

	CPU, err := s.CPURepo.FindByID(ctx, benchmark.CPUId)
	if err != nil {
		return 0, err
	}
	
	GPU, err := s.GPURepo.FindByID(ctx, benchmark.GPUId)
	if err != nil {
		return 0, err
	}

	RAM, err := s.RAMRepo.FindByID(ctx, benchmark.RAMId)
	if err != nil {
		return 0, err
	}

	var price float32 = CPU.AvgPrice + GPU.AvgPrice + RAM.AvgPrice

	normalizedScore := float32(score) / price
	
	finalScore := normalizedScore * 10000
	
	return int32(finalScore), nil
}
