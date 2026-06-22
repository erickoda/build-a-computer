package services

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"

	persist "github.com/erickoda/build-a-computer/recommendation_microservice/internal/adapters/db"
	e "github.com/erickoda/build-a-computer/recommendation_microservice/internal/domain/enums"
	model "github.com/erickoda/build-a-computer/recommendation_microservice/internal/domain/models"
	"github.com/erickoda/build-a-computer/recommendation_microservice/internal/services"
)

func TestGetMotherBoardBySocketAndPCIEAndDDR(t *testing.T) {
	benchTime, err := time.Parse(time.DateTime, "2026-05-29 20:55:49.821314")
	if err != nil {
		t.Fatalf("failed to parse time: %v", err)
	}
	
	benchmarks := []model.Benchmark{
		{
			ID: uuid.MustParse("1bdca654-f494-4f6c-b713-c5e628d2a40b"),
			Title: "Elden ring low",
			Resolution: 1080,
			ComputerPerformance: e.ComputerPerformanceMedium,
			CPUId: uuid.MustParse("fdddd124-f06e-425b-b618-905848fe3200"),
			GPUId: uuid.MustParse("c8a0f68a-cd10-4593-a080-b3bb72206eb9"),
			RAMId: uuid.MustParse("429a6381-8698-46fb-9e8d-e700d47ac68d"),
			AvgFps: 70,
			MaxFps: 83,
			MinFps: 55,
			GameId: uuid.MustParse("326261be-a55a-4b31-bc7f-c6b7dfd69a61"),
			UserId: uuid.MustParse("ed69a980-ba55-4cb9-aa4f-436394717c45"),
			Score: 0,
			CreatedAt: benchTime,
			UpdatedAt: benchTime,
		},
		{
			ID: uuid.MustParse("a827d676-afea-437f-8ff4-44cc4d362960"),
			Title: "Elden ring ultra",
			Resolution: 1080,
			ComputerPerformance: e.ComputerPerformanceUltra,
			CPUId: uuid.MustParse("fdddd124-f06e-425b-b618-905848fe3200"),
			GPUId: uuid.MustParse("c8a0f68a-cd10-4593-a080-b3bb72206eb9"),
			RAMId: uuid.MustParse("429a6381-8698-46fb-9e8d-e700d47ac68d"),
			AvgFps: 54,
			MaxFps: 60,
			MinFps: 44,
			GameId: uuid.MustParse("326261be-a55a-4b31-bc7f-c6b7dfd69a61"),
			UserId: uuid.MustParse("ed69a980-ba55-4cb9-aa4f-436394717c45"),
			Score: 0,
			CreatedAt: benchTime,
			UpdatedAt: benchTime,
		},
		{
			ID: uuid.MustParse("fb672051-b2ef-400a-87cb-2f5b2fe494ca"),
			Title: "Elden ring running good",
			Resolution: 1080,
			ComputerPerformance: e.ComputerPerformanceHigh,
			CPUId: uuid.MustParse("fdddd124-f06e-425b-b618-905848fe3200"),
			GPUId: uuid.MustParse("c8a0f68a-cd10-4593-a080-b3bb72206eb9"),
			RAMId: uuid.MustParse("429a6381-8698-46fb-9e8d-e700d47ac68d"),
			AvgFps: 67,
			MaxFps: 72,
			MinFps: 57,
			GameId: uuid.MustParse("326261be-a55a-4b31-bc7f-c6b7dfd69a61"),
			UserId: uuid.MustParse("ed69a980-ba55-4cb9-aa4f-436394717c45"),
			Score: 0,
			CreatedAt: benchTime,
			UpdatedAt: benchTime,
		},
		{
			ID: uuid.MustParse("fb672051-b2ef-400a-87cb-2f5b2fe494ca"),
			Title: "Elden ring medium",
			Resolution: 1080,
			ComputerPerformance: e.ComputerPerformanceMedium,
			CPUId: uuid.MustParse("fdddd124-f06e-425b-b618-905848fe3200"),
			GPUId: uuid.MustParse("c8a0f68a-cd10-4593-a080-b3bb72206eb9"),
			RAMId: uuid.MustParse("429a6381-8698-46fb-9e8d-e700d47ac68d"),
			AvgFps: 71,
			MaxFps: 78,
			MinFps: 67,
			GameId: uuid.MustParse("326261be-a55a-4b31-bc7f-c6b7dfd69a61"),
			UserId: uuid.MustParse("ed69a980-ba55-4cb9-aa4f-436394717c45"),
			Score: 0,
			CreatedAt: benchTime,
			UpdatedAt: benchTime,
		},
		{
			ID: uuid.MustParse("e25f7f01-60e1-40e4-b9cb-2791e7d90586"),
			Title: "Elden ring running very good",
			Resolution: 1080,
			ComputerPerformance: e.ComputerPerformanceLow,
			CPUId: uuid.MustParse("fdddd124-f06e-425b-b618-905848fe3200"),
			GPUId: uuid.MustParse("c8a0f68a-cd10-4593-a080-b3bb72206eb9"),
			RAMId: uuid.MustParse("429a6381-8698-46fb-9e8d-e700d47ac68d"),
			AvgFps: 74,
			MaxFps: 81,
			MinFps: 67,
			GameId: uuid.MustParse("326261be-a55a-4b31-bc7f-c6b7dfd69a61"),
			UserId: uuid.MustParse("ed69a980-ba55-4cb9-aa4f-436394717c45"),
			Score: 0,
			CreatedAt: benchTime,
			UpdatedAt: benchTime,
		},
	}
	
	is := assert.New(t)

	ctx := context.Background()

	db, err := persist.NewDataBase()
	if err != nil {
		t.Fatalf("failed to run migrate: %v", err)
	}
	defer db.Close()

	benchmark_repo := &persist.BenchmarkRepositoryImpl{DB: db}
	cpu_repo := &persist.CPURepositoryImpl{DB: db}
	gpu_repo := &persist.GPURepositoryImpl{DB: db}
	ram_repo := &persist.RAMMemoryRepositoryImpl{DB: db}
	mother_board_repo := &persist.MotherBoardRepositoryImpl{DB: db}
	powerSourceRepo := &persist.PowerSourceRepositoryImpl{DB: db}
	ssdRepo := &persist.SSDRepositoryImpl{DB: db}
	gameRepo := &persist.GameRepositoryImpl{DB: db}
	
	svc := services.NewBuilderService(
		benchmark_repo, 
		cpu_repo, 
		gpu_repo, 
		ram_repo, 
		mother_board_repo, 
		powerSourceRepo, 
		ssdRepo, 
		gameRepo,
	)
	
	motherBoards, err := svc.GetMotherBoardBySocketAndDDR(ctx, []string{"LGA1700"}, []string{"ddr4"}, benchmarks)
	if err != nil {
		t.Fatalf("failed to get mother board by socket and pcie and ddr: %v", err)
	}

	is.Len(motherBoards, 1)

	for _, board := range motherBoards {
		fmt.Printf("%v\n", board)
	}
}

func TestGetMotherBoardByScore(t *testing.T) {
	performance := "High"
	benchTime, err := time.Parse(time.DateTime, "2026-05-29 20:55:49.821314")
	if err != nil {
		t.Fatalf("failed to parse time: %v", err)
	}
	
	benchmarks := []model.Benchmark{
		{
			ID: uuid.MustParse("1bdca654-f494-4f6c-b713-c5e628d2a40b"),
			Title: "Elden ring low",
			Resolution: 1080,
			ComputerPerformance: e.ComputerPerformanceMedium,
			CPUId: uuid.MustParse("fdddd124-f06e-425b-b618-905848fe3200"),
			GPUId: uuid.MustParse("c8a0f68a-cd10-4593-a080-b3bb72206eb9"),
			RAMId: uuid.MustParse("429a6381-8698-46fb-9e8d-e700d47ac68d"),
			AvgFps: 70,
			MaxFps: 83,
			MinFps: 55,
			GameId: uuid.MustParse("326261be-a55a-4b31-bc7f-c6b7dfd69a61"),
			UserId: uuid.MustParse("ed69a980-ba55-4cb9-aa4f-436394717c45"),
			Score: 0,
			CreatedAt: benchTime,
			UpdatedAt: benchTime,
		},
		{
			ID: uuid.MustParse("a827d676-afea-437f-8ff4-44cc4d362960"),
			Title: "Elden ring ultra",
			Resolution: 1080,
			ComputerPerformance: e.ComputerPerformanceUltra,
			CPUId: uuid.MustParse("fdddd124-f06e-425b-b618-905848fe3200"),
			GPUId: uuid.MustParse("c8a0f68a-cd10-4593-a080-b3bb72206eb9"),
			RAMId: uuid.MustParse("429a6381-8698-46fb-9e8d-e700d47ac68d"),
			AvgFps: 54,
			MaxFps: 60,
			MinFps: 44,
			GameId: uuid.MustParse("326261be-a55a-4b31-bc7f-c6b7dfd69a61"),
			UserId: uuid.MustParse("ed69a980-ba55-4cb9-aa4f-436394717c45"),
			Score: 0,
			CreatedAt: benchTime,
			UpdatedAt: benchTime,
		},
		{
			ID: uuid.MustParse("fb672051-b2ef-400a-87cb-2f5b2fe494ca"),
			Title: "Elden ring running good",
			Resolution: 1080,
			ComputerPerformance: e.ComputerPerformanceHigh,
			CPUId: uuid.MustParse("fdddd124-f06e-425b-b618-905848fe3200"),
			GPUId: uuid.MustParse("c8a0f68a-cd10-4593-a080-b3bb72206eb9"),
			RAMId: uuid.MustParse("429a6381-8698-46fb-9e8d-e700d47ac68d"),
			AvgFps: 67,
			MaxFps: 72,
			MinFps: 57,
			GameId: uuid.MustParse("326261be-a55a-4b31-bc7f-c6b7dfd69a61"),
			UserId: uuid.MustParse("ed69a980-ba55-4cb9-aa4f-436394717c45"),
			Score: 0,
			CreatedAt: benchTime,
			UpdatedAt: benchTime,
		},
		{
			ID: uuid.MustParse("fb672051-b2ef-400a-87cb-2f5b2fe494ca"),
			Title: "Elden ring medium",
			Resolution: 1080,
			ComputerPerformance: e.ComputerPerformanceMedium,
			CPUId: uuid.MustParse("fdddd124-f06e-425b-b618-905848fe3200"),
			GPUId: uuid.MustParse("c8a0f68a-cd10-4593-a080-b3bb72206eb9"),
			RAMId: uuid.MustParse("429a6381-8698-46fb-9e8d-e700d47ac68d"),
			AvgFps: 71,
			MaxFps: 78,
			MinFps: 67,
			GameId: uuid.MustParse("326261be-a55a-4b31-bc7f-c6b7dfd69a61"),
			UserId: uuid.MustParse("ed69a980-ba55-4cb9-aa4f-436394717c45"),
			Score: 0,
			CreatedAt: benchTime,
			UpdatedAt: benchTime,
		},
		{
			ID: uuid.MustParse("e25f7f01-60e1-40e4-b9cb-2791e7d90586"),
			Title: "Elden ring running very good",
			Resolution: 1080,
			ComputerPerformance: e.ComputerPerformanceLow,
			CPUId: uuid.MustParse("fdddd124-f06e-425b-b618-905848fe3200"),
			GPUId: uuid.MustParse("c8a0f68a-cd10-4593-a080-b3bb72206eb9"),
			RAMId: uuid.MustParse("429a6381-8698-46fb-9e8d-e700d47ac68d"),
			AvgFps: 74,
			MaxFps: 81,
			MinFps: 67,
			GameId: uuid.MustParse("326261be-a55a-4b31-bc7f-c6b7dfd69a61"),
			UserId: uuid.MustParse("ed69a980-ba55-4cb9-aa4f-436394717c45"),
			Score: 0,
			CreatedAt: benchTime,
			UpdatedAt: benchTime,
		},
	}
	
	//is := assert.New(t)

	ctx := context.Background()

	db, err := persist.NewDataBase()
	if err != nil {
		t.Fatalf("failed to run migrate: %v", err)
	}
	defer db.Close()
	
	benchmark_repo := &persist.BenchmarkRepositoryImpl{DB: db}
	cpu_repo := &persist.CPURepositoryImpl{DB: db}
	gpu_repo := &persist.GPURepositoryImpl{DB: db}
	ram_repo := &persist.RAMMemoryRepositoryImpl{DB: db}
	mother_board_repo := &persist.MotherBoardRepositoryImpl{DB: db}
	powerSourceRepo := &persist.PowerSourceRepositoryImpl{DB: db}
	ssdRepo := &persist.SSDRepositoryImpl{DB: db}
	gameRepo := &persist.GameRepositoryImpl{DB: db}
	
	svc := services.NewBuilderService(
		benchmark_repo, 
		cpu_repo, 
		gpu_repo, 
		ram_repo, 
		mother_board_repo, 
		powerSourceRepo, 
		ssdRepo, 
		gameRepo,
	)
	
	selectedBenchmarks, err := svc.GetBenchmarksByBestScore(ctx, benchmarks, performance)
	if err != nil{
		t.Fatalf("failed to get benchmarks by best score: %v", err)
	}

	fmt.Println(selectedBenchmarks)

	for _, benchmark := range selectedBenchmarks {
		fmt.Printf("%v\n", benchmark)
	}

	sockets, err := svc.GetBenchmarksSockets(ctx, selectedBenchmarks)
	if err != nil {
		t.Fatalf("failed to get benchmarks sockets: %v", err)
	}

	ddr, err := svc.GetBenchmarksDDRs(ctx, selectedBenchmarks)
	if err != nil {
		t.Fatalf("failed to get benchmarks ddr: %v", err)
	}

	motherBoard, err := svc.GetMotherBoardBySocketAndDDR(ctx, sockets, ddr, selectedBenchmarks)
	if err != nil {
		t.Fatalf("failed to get benchmarks mother board: %v", err)
	}

	for _, mb := range motherBoard {
		fmt.Printf("%v\n", mb)
	}

	motherBardsMappedByBenchmark, err := svc.GetMotherBoardsByScore(ctx, motherBoard, performance)
	if err != nil{
		t.Fatalf("failed to get mother boards by score: %v", err)
	}

	for _, mb := range motherBardsMappedByBenchmark {
		fmt.Printf("%v\n", mb)
	}
}