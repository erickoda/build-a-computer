package services

import (
	"cmp"
	"context"
	"fmt"
	"math"
	"slices"
	"strings"
	"time"

	repository "github.com/erickoda/build-a-computer/pc_builder_service/internal/adapters/db"
	e "github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/enums"
	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/ports"
	"github.com/google/uuid"
)

type BuilderService struct {
	BenchmarkRepo repository.BenchmarkRepositoryImpl
	CPURepo repository.CPURepositoryImpl
	GPURepo repository.GPURepositoryImpl
	RAMRepo repository.RAMMemoryRepositoryImpl
	MotherBoardRepo repository.MotherBoardRepositoryImpl
	PowerSourceRepo repository.PowerSourceRepositoryImpl
	SSDRepo repository.SSDRepositoryImpl
	GameRepo repository.GameRepositoryImpl
}

func NewBuilderService(
	benchmarkRepoImpl *repository.BenchmarkRepositoryImpl, 
	cpuRepoImpl *repository.CPURepositoryImpl,
	gpuRepoImpl *repository.GPURepositoryImpl,
	ramRepoImpl *repository.RAMMemoryRepositoryImpl,
	motherBoardRepoImpl *repository.MotherBoardRepositoryImpl,
	powerSourceRepoImpl *repository.PowerSourceRepositoryImpl,
	ssdRepoImpl *repository.SSDRepositoryImpl,
	gameRepoImpl *repository.GameRepositoryImpl,
)  ports.BuilderPort {
	
	return &BuilderService{
		BenchmarkRepo: *benchmarkRepoImpl,
		CPURepo: *cpuRepoImpl,
		GPURepo: *gpuRepoImpl,
		RAMRepo: *ramRepoImpl,
		MotherBoardRepo: *motherBoardRepoImpl,
		PowerSourceRepo: *powerSourceRepoImpl,
		SSDRepo: *ssdRepoImpl,
		GameRepo: *gameRepoImpl,
	}
}

func (s *BuilderService) GetCPUsByID(
	ctx context.Context,
	benchmarks []models.Benchmark,
) (map[uuid.UUID]models.CPU, error) {
	
	cpuMappedByBenchmark := make(map[uuid.UUID]models.CPU)
	
	for _, benchmark := range benchmarks {
		CPU, err := s.CPURepo.FindByID(ctx, benchmark.CPUId)
		if err != nil {
			return nil, err
		}
		
		cpuMappedByBenchmark[benchmark.ID] = *CPU
	}
	
	return cpuMappedByBenchmark, nil
}

func (s *BuilderService) GetGPUsByID(
	ctx context.Context,
	benchmarks []models.Benchmark,
) (map[uuid.UUID]models.GPU, error) {
	
	gpuMappedByBenchmark := make(map[uuid.UUID]models.GPU)
	
	for _, benchmark := range benchmarks {
		GPU, err := s.GPURepo.FindByID(ctx, benchmark.GPUId)
		if err != nil {
			return nil, err
		}
		
		gpuMappedByBenchmark[benchmark.ID] = *GPU
	}
	
	return gpuMappedByBenchmark, nil
}

func (s *BuilderService) GetRAMsByID(
	ctx context.Context,
	benchmarks []models.Benchmark,
) (map[uuid.UUID]models.RamMemory, error) {
	
	ramMappedByBenchmark := make(map[uuid.UUID]models.RamMemory)
	
	for _, benchmark := range benchmarks {
		RAM, err := s.RAMRepo.FindByID(ctx, benchmark.RAMId)
		if err != nil {
			return nil, err
		}
		
		ramMappedByBenchmark[benchmark.ID] = *RAM
	}
	
	return ramMappedByBenchmark, nil
}

func (s *BuilderService) GetGameByID(
	ctx context.Context,
	gamesIDs []string,
) ([]models.Game, error) {
	
	gamesParsed, err := models.ParseID(gamesIDs...)
	if err != nil {
		return nil, err
	}
	
	games := make([]models.Game, 0, len(gamesParsed))
	
	for _, gameId := range gamesParsed {
		game, err := s.GameRepo.FindByID(ctx, gameId)
		if err != nil {
			return nil, err
		}
		games = append(games, *game)
	}
	
	return games, nil
}

func (s *BuilderService) GetBenchmarksByHavierGame(
	ctx context.Context, 
	games []string, 
	resolution int32,
) ([]models.Benchmark, error) {
		
	gamesParsed, err := models.ParseID(games...)
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
	benchmarks []models.Benchmark,
	performance string,
) ([]models.Benchmark, error) {

	const NUMBER_OF_SELECTED_BENCHMARKS = 1
	
	var performanceWeight int32
	var performanceQuartileFloor float64
	var performanceQuartileCeil float64
	var size = len(benchmarks)
	var selectedBenchmarks []models.Benchmark

	requestedPerformance, err := e.ParseComputerPerformance(strings.ToLower(performance))
	if err != nil {
		return nil, err
	}
	

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

	slices.SortFunc(benchmarks, func(i, j models.Benchmark) int {
		 return cmp.Compare(i.Score, j.Score)
	})

	switch requestedPerformance {
	case e.ComputerPerformanceLow:
		performanceQuartileCeil = 0.30
		
		if len(benchmarks) <= NUMBER_OF_SELECTED_BENCHMARKS {
			return benchmarks, nil
		}

		ceilIndex := (int(math.Floor(float64(size) * performanceQuartileCeil)))
		benchmarks = benchmarks[:ceilIndex]

		selectedBenchmarks = benchmarks[:NUMBER_OF_SELECTED_BENCHMARKS]
		
	case e.ComputerPerformanceMedium:
		performanceQuartileFloor = 0.30
		performanceQuartileCeil = 0.60

		if len(benchmarks) <= NUMBER_OF_SELECTED_BENCHMARKS {
			return benchmarks, nil
		}

		floorIndex := (int(math.Floor(float64(size) * performanceQuartileFloor)))
		ceilIndex := (int(math.Floor(float64(size) * performanceQuartileCeil)))
		
		benchmarks = benchmarks[floorIndex:ceilIndex]

		selectedBenchmarks = benchmarks[:NUMBER_OF_SELECTED_BENCHMARKS]
		
	case e.ComputerPerformanceHigh:
		performanceQuartileFloor = 0.60
		performanceQuartileCeil = 0.90

		if len(benchmarks) <= NUMBER_OF_SELECTED_BENCHMARKS {
			return benchmarks, nil
		}

		floorIndex := int(math.Floor(float64(size) * performanceQuartileFloor))
		ceilIndex := int(math.Floor(float64(size) * performanceQuartileCeil))
		
		benchmarks = benchmarks[floorIndex:ceilIndex]
		
		selectedBenchmarks = benchmarks[:NUMBER_OF_SELECTED_BENCHMARKS]
		
	case e.ComputerPerformanceUltra:
		performanceQuartileFloor = 0.90

		if len(benchmarks) <= NUMBER_OF_SELECTED_BENCHMARKS {
			return benchmarks, nil
		}

		floorIndex := (int(math.Floor(float64(size) * performanceQuartileFloor)))
		if floorIndex == size {
			selectedBenchmarks = append(selectedBenchmarks, benchmarks[size-1])
			break
		}
		
		benchmarks = benchmarks[floorIndex:]

		selectedBenchmarks = benchmarks[:NUMBER_OF_SELECTED_BENCHMARKS]
		
	}

	return selectedBenchmarks, nil
}

func (s *BuilderService) GetBenchmarksSockets(ctx context.Context, benchmarks []models.Benchmark) ([]string, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var sockets []string
	for _, benchmark := range benchmarks {
		CPU, err := s.CPURepo.FindByID(ctx, benchmark.CPUId)
		if err != nil {
			return nil, err
		}
		sockets = append(sockets, CPU.Socket)
	}

	return sockets, nil
}

func (s *BuilderService) GetBenchmarksDDRs(ctx context.Context, benchmarks []models.Benchmark) ([]string, error) {
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	
	var ddr []string
	for _, benchmark := range benchmarks {
		RAM, err := s.RAMRepo.FindByID(ctx, benchmark.RAMId)
		if err != nil {
			return nil, err
		}
		ddr = append(ddr, RAM.DDR)
	}

	return ddr, nil
}

func (s *BuilderService) GetMotherBoardBySocketAndDDR(
	ctx context.Context,
	sockets []string,
	ddr []string,
	selectedBenchmarks []models.Benchmark,
) (map[string]map[uuid.UUID][]models.MotherBoard, error) {

	var size int = len(selectedBenchmarks)
	motherBoardsMappedBySocketAndDDR := make(map[string]map[uuid.UUID][]models.MotherBoard)

	if size != len(sockets) {
		return nil, fmt.Errorf("sockets and benchmarks slices must have the same length")
	}

	if size != len(ddr) {
		return nil, fmt.Errorf("socket and ddr slices must have the same length")
	}

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	for i := range size {
		mbs, err := s.MotherBoardRepo.FindBySocketAndDDR(ctx, sockets[i], ddr[i])
		if err != nil {
			return nil, err
		}

		key := sockets[i] + "-" + ddr[i]
		if _, ok := motherBoardsMappedBySocketAndDDR[key]; !ok {
			motherBoardsMappedBySocketAndDDR[key] = make(map[uuid.UUID][]models.MotherBoard)
		}
		motherBoardsMappedBySocketAndDDR[key][selectedBenchmarks[i].ID] = mbs
	}

	return motherBoardsMappedBySocketAndDDR, nil
}

func (s *BuilderService) GetMotherBoardsByScore(
	ctx context.Context,
	motherBoardsMappedBySocketAndDDR map[string]map[uuid.UUID][]models.MotherBoard,
	performance string, 
) (map[uuid.UUID]models.MotherBoard, error) {

	var motherBoardQuartile float64

	var motherBoardsByScore map[uuid.UUID]models.MotherBoard = make(map[uuid.UUID]models.MotherBoard)
	var err error

	requestedPerformance, err := e.ParseComputerPerformance(strings.ToLower(performance))
	if err != nil {
		return nil, err
	}
	
	for key := range motherBoardsMappedBySocketAndDDR {
		for benchmarkID := range motherBoardsMappedBySocketAndDDR[key] {
			for i := range motherBoardsMappedBySocketAndDDR[key][benchmarkID] {
				if motherBoardsMappedBySocketAndDDR[key][benchmarkID][i].Score > 0 {
					continue
				}

				motherBoardsMappedBySocketAndDDR[key][benchmarkID][i].Score, 
					err = calculateMotherBoardScore(motherBoardsMappedBySocketAndDDR[key][benchmarkID][i])
				if err != nil {
					return nil, err
				}
			}
		}
	}
	

	for key := range motherBoardsMappedBySocketAndDDR {
		for benchmarkID := range motherBoardsMappedBySocketAndDDR[key] {
			slices.SortFunc(motherBoardsMappedBySocketAndDDR[key][benchmarkID], func(i, j models.MotherBoard) int {
				return cmp.Compare(i.Score, j.Score)
			})
		}
	}

	for key := range motherBoardsMappedBySocketAndDDR {
		for benchmarkID := range motherBoardsMappedBySocketAndDDR[key] {

			var size = len(motherBoardsMappedBySocketAndDDR[key][benchmarkID])

			switch requestedPerformance {
			case e.ComputerPerformanceLow:
				motherBoardQuartile = 0.3

				index := int(math.Floor(float64(size) * motherBoardQuartile))
				selectedMotherBoard := motherBoardsMappedBySocketAndDDR[key][benchmarkID][index]

				motherBoardsByScore[benchmarkID] = selectedMotherBoard
				
			case e.ComputerPerformanceMedium:
				motherBoardQuartile = 0.6

				index := int(math.Floor(float64(size) * motherBoardQuartile))
				selectedMotherBoard := motherBoardsMappedBySocketAndDDR[key][benchmarkID][index]

				motherBoardsByScore[benchmarkID] = selectedMotherBoard
				
			case e.ComputerPerformanceHigh:
				motherBoardQuartile = 0.9

				index := int(math.Floor(float64(size) * motherBoardQuartile))
				selectedMotherBoard := motherBoardsMappedBySocketAndDDR[key][benchmarkID][index]

				motherBoardsByScore[benchmarkID] = selectedMotherBoard
				
			case e.ComputerPerformanceUltra:
				index := int(size) - 1
				selectedMotherBoard := motherBoardsMappedBySocketAndDDR[key][benchmarkID][index]

				motherBoardsByScore[benchmarkID] = selectedMotherBoard
			}
		}
	}

	return motherBoardsByScore, nil
}

func (s *BuilderService) GetPowerSourcesByRecommendedPower(
		ctx context.Context,
		selectedBenchmarks []models.Benchmark,
) (map[uuid.UUID][]models.PowerSource, error) {

	powerSourcesByBenchmark := make(map[uuid.UUID][]models.PowerSource)

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	
	for _, benchmark := range selectedBenchmarks {
		cpu, err := s.CPURepo.FindByID(ctx, benchmark.CPUId)
		if err != nil {
			return nil, err
		}

		gpu, err := s.GPURepo.FindByID(ctx, benchmark.GPUId)
		if err != nil {
			return nil, err
		}

		var power []int32
		higherPower := int32(math.Max(float64(cpu.RecommendedPower), float64(gpu.RecommendedPower)))

		power = append(power, higherPower)
		power = append(power, higherPower+100)

		powerSources, err := s.PowerSourceRepo.FindByRecommendedPowerSource(ctx, power)
		if err != nil {
			return nil, err
		}
		
		powerSourcesByBenchmark[benchmark.ID] = powerSources
	}

	return powerSourcesByBenchmark, nil
}

func (s *BuilderService) GetPowerSourcesByScore(
		ctx context.Context,
		powerSourcesMappedByBenchmark map[uuid.UUID][]models.PowerSource,
) (map[uuid.UUID]models.PowerSource, error) {
	
	powerSourcesByScore := make(map[uuid.UUID]models.PowerSource)
	var err error

	for benchmarkID := range powerSourcesMappedByBenchmark {
		for i := range powerSourcesMappedByBenchmark[benchmarkID] {
			if powerSourcesMappedByBenchmark[benchmarkID][i].Score > 0 {
				continue
			}
			
			powerSourcesMappedByBenchmark[benchmarkID][i].Score, 
				err = calculatePowerSourceScore(powerSourcesMappedByBenchmark[benchmarkID][i])
			if err != nil {
				return nil, err
			}
		}
	}

	for benchmarkID := range powerSourcesMappedByBenchmark {
		slices.SortFunc(powerSourcesMappedByBenchmark[benchmarkID], func(i, j models.PowerSource) int {
			return cmp.Compare(i.Score, j.Score)
		})
	}

	for benchmarkID := range powerSourcesMappedByBenchmark {
		size := len(powerSourcesMappedByBenchmark[benchmarkID])
		if size == 0 {
			continue
		}
		
		powerSourcesByScore[benchmarkID] = powerSourcesMappedByBenchmark[benchmarkID][size-1]
	}

	return powerSourcesByScore, nil
}

func (s *BuilderService) GetSSDByMinimumPowerAmount(
	ctx context.Context,
	games []models.Game,
	benchmarks []models.Benchmark,
) (map[uuid.UUID][]models.SSD, error) {
	
	ssdsMappedByBenchmark := make(map[uuid.UUID][]models.SSD)

	var gamesNecessaryDisk int32 = 0
	
	for _, game := range games {
		gamesNecessaryDisk += game.NecessaryDisk
	}

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	for _, benchmark := range benchmarks {
		ssds, err := s.SSDRepo.FindByMinimumAmount(ctx, gamesNecessaryDisk)
		if err != nil {
			return nil, err
		}
		
		ssdsMappedByBenchmark[benchmark.ID] = ssds
	}

	return ssdsMappedByBenchmark, nil
}

func (s *BuilderService) GetSSDByScore(
	ctx context.Context,
	ssdsMappedByBenchmark map[uuid.UUID][]models.SSD,
	performance string,
) (map[uuid.UUID]models.SSD, error) {

	ssdMappedByBenchmark := make(map[uuid.UUID]models.SSD)
	requestedPerformance, err := e.ParseComputerPerformance(strings.ToLower(performance))
	if err != nil {
		return nil, err
	}
	
	for benchmarkID := range ssdsMappedByBenchmark {
		for i := range ssdsMappedByBenchmark[benchmarkID] {
			
			if ssdsMappedByBenchmark[benchmarkID][i].Score > 0 {
				continue
			}
			
			ssdsMappedByBenchmark[benchmarkID][i].Score, err = calculateSDDScore(ssdsMappedByBenchmark[benchmarkID][i])
			if err != nil {
				return nil, err
			}
		}
	}

	for benchmarkID := range ssdsMappedByBenchmark {
		slices.SortFunc(ssdsMappedByBenchmark[benchmarkID], func(i, j models.SSD) int {
			return cmp.Compare(i.Score, j.Score)
		})
	}

	for benchmarkID := range ssdsMappedByBenchmark {
		size := len(ssdsMappedByBenchmark[benchmarkID])
		
		switch requestedPerformance {
			case e.ComputerPerformanceLow:
				ssdQuartile := 0.3
	
				index := int(math.Floor(float64(size) * ssdQuartile))
				ssdMappedByBenchmark[benchmarkID] = ssdsMappedByBenchmark[benchmarkID][index]
				
			case e.ComputerPerformanceMedium:
				ssdQuartile := 0.6
				
				index := int(math.Floor(float64(size) * ssdQuartile))
				ssdMappedByBenchmark[benchmarkID] = ssdsMappedByBenchmark[benchmarkID][index]
	
			case e.ComputerPerformanceHigh:
				ssdQuartile := 0.9
				
				index := int(math.Floor(float64(size) * ssdQuartile))
				ssdMappedByBenchmark[benchmarkID] = ssdsMappedByBenchmark[benchmarkID][index]

			case e.ComputerPerformanceUltra:
				ssdMappedByBenchmark[benchmarkID] = ssdsMappedByBenchmark[benchmarkID][size-1]
		}
	}
	
	return ssdMappedByBenchmark, nil
}

func (s *BuilderService) CreatePCs(
	cpu map[uuid.UUID]models.CPU,
	gpu map[uuid.UUID]models.GPU,
	ram map[uuid.UUID]models.RamMemory,
	motherBoard map[uuid.UUID]models.MotherBoard,
	powerSource map[uuid.UUID]models.PowerSource,
	ssd map[uuid.UUID]models.SSD,
) []models.PC {
	
	var PCs []models.PC

	for id := range cpu {
		PC := models.PC {
			CPU:         		cpu[id],
			GPU:         		gpu[id],
			RAMMemory:         	ram[id],
			MotherBoard: 		motherBoard[id],
			PowerSource: 		powerSource[id],
			SSD:         		ssd[id],
		}
		PCs = append(PCs, PC)
	}
	
	return PCs
}

func calculatePerformanceScore(
	ctx context.Context,
	benchmark models.Benchmark,
	performanceWeight int32,
	s *BuilderService,
) (int32, error) {
	
	var score int32 = int32(benchmark.AvgFps) * performanceWeight
	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
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

func calculateMotherBoardScore(motherBoard models.MotherBoard) (int32, error) {
	const PCI_EXPRESS_COEFICIENT float64 = 0.5
	const MAX_RAM_MEMORY_FREQUENCY_MHZ float64 = 0.001
	const MAX_RAM_COEFICIENT float64 = 0.1
	const VRM_COEFICIENT float64 = 1.5
	
	var score float64

	score = (float64(motherBoard.PciExpress) * PCI_EXPRESS_COEFICIENT) *
		(float64(motherBoard.MaxRamMemoryFrequencyMhz) * MAX_RAM_MEMORY_FREQUENCY_MHZ) *
		(float64(motherBoard.MaxRam) * MAX_RAM_COEFICIENT) *
		(float64(motherBoard.Vrm) * VRM_COEFICIENT) *
		float64(motherBoard.MemorySlots)

	normalizedScore := float32(score) / motherBoard.AvgPrice

	finalScore := normalizedScore * 100

	return int32(finalScore), nil
}

func calculatePowerSourceScore(powerSource models.PowerSource) (int32, error) {
	const EIGHTY_PLUS_CERT_COEFICIENT float64 = 2.0

	var score float64 = 0.0

	switch powerSource.Ranking {
		case e.PowerSourceRankingWhite:
			if !powerSource.EightyPlusCert {
				score = 1
				break
			}

			score = 1 * EIGHTY_PLUS_CERT_COEFICIENT
			
		case e.PowerSourceRankingBronze:
			if !powerSource.EightyPlusCert {
				score = 2
				break
			}

			score = 2 * EIGHTY_PLUS_CERT_COEFICIENT

		case e.PowerSourceRankingSilver:
			if !powerSource.EightyPlusCert {
				score = 3
				break
			}

			score = 3 * EIGHTY_PLUS_CERT_COEFICIENT

		case e.PowerSourceRankingGold:
			if !powerSource.EightyPlusCert {
				score = 4
				break
			}

			score = 4 * EIGHTY_PLUS_CERT_COEFICIENT

		case e.PowerSourceRankingPlatinum:
			if !powerSource.EightyPlusCert {
				score = 5
				break
			}

			score = 5 * EIGHTY_PLUS_CERT_COEFICIENT

		case e.PowerSourceRankingTitanium:
			if !powerSource.EightyPlusCert {
				score = 6
				break
			}

			score = 6 * EIGHTY_PLUS_CERT_COEFICIENT
	}

	normalizedScore := score / float64(powerSource.AvgPrice)
	finalScore := normalizedScore * 10000

	return int32(finalScore), nil
}

func calculateSDDScore(ssd models.SSD) (int32, error) {
	const READING_COEFICIENT float64 = 0.001
	const WRITING_COEFICIENT float64 = 0.001
	const AMOUNT_COEFICIENT float64 = 0.01

	var score float64 = 0.0

	switch ssd.Type {
		case e.SDDTypeSATA:
			score = float64(ssd.Reading) * READING_COEFICIENT + 
				float64(ssd.Writing) * WRITING_COEFICIENT *
				float64(ssd.Amount) * AMOUNT_COEFICIENT *
				1.15
			
		case e.SDDTypeM2SATA:
			score = float64(ssd.Reading) * READING_COEFICIENT + 
				float64(ssd.Writing) * WRITING_COEFICIENT *
				float64(ssd.Amount) * AMOUNT_COEFICIENT *
				1.30

		case e.SDDTypeM2NVMe:
			score = float64(ssd.Reading) * READING_COEFICIENT + 
				float64(ssd.Writing) * WRITING_COEFICIENT *
				float64(ssd.Amount) * AMOUNT_COEFICIENT *
				1.50			
	}

	normalizedScore := score / float64(ssd.AvgPrice)
	finalScore := normalizedScore * 1000

	return int32(finalScore), nil
}
