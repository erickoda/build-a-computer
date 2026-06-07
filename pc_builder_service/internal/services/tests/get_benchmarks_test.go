package services

import (
	"context"
	"fmt"
	"testing"
	"time"

	persist "github.com/erickoda/build-a-computer/pc_builder_service/internal/adapters/db"
	e "github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/enums"
	model "github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"github.com/erickoda/build-a-computer/pc_builder_service/internal/services"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestGetBenchmarksByHavierGame(t *testing.T) {
	is := assert.New(t)

	ctx := context.Background()

	db := &persist.DB{}
	if err := db.NewDataBase(); err != nil {
		t.Fatalf("failed to run migrate: %v", err)
	}
	defer db.Close()

	benchmark_repo := &persist.BenchmarkRepositoryImpl{DB: db.DB}

	benchmarks, err := benchmark_repo.FindBenchmarksByHavierGame(
		ctx, 
		[]uuid.UUID{uuid.MustParse("fbf6d75a-1555-43d8-b346-8866e975d66b"), 
			uuid.MustParse("326261be-a55a-4b31-bc7f-c6b7dfd69a61")}, 
		1080,
	)	
	if err != nil {
		t.Fatalf("failed to find benchmarks: %v", err)
	}
	
	is.NotEmpty(benchmarks)
	
	benchTime, err := time.Parse(time.DateTime, "2026-05-29 20:55:49.821314")
	if err != nil {
		t.Fatalf("failed to parse time: %v", err)
	}

	is.Equal(
		[]model.Benchmark{
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
				Title: "Elden ring very low",
				Resolution: 1080,
				ComputerPerformance: e.ComputerPerformanceHigh,
				CPUId: uuid.MustParse("fdddd124-f06e-425b-b618-905848fe3200"),
				GPUId: uuid.MustParse("c8a0f68a-cd10-4593-a080-b3bb72206eb9"),
				RAMId: uuid.MustParse("429a6381-8698-46fb-9e8d-e700d47ac68d"),
				AvgFps: 62,
				MaxFps: 69,
				MinFps: 44,
				GameId: uuid.MustParse("326261be-a55a-4b31-bc7f-c6b7dfd69a61"),
				UserId: uuid.MustParse("ed69a980-ba55-4cb9-aa4f-436394717c45"),
				Score: 0,
				CreatedAt: benchTime,
				UpdatedAt: benchTime,
			},
		},
		benchmarks,
		"should be equal to the expected benchmark IDs",
	)

	is.NoError(err, "should not error")
}

func TestBenchmarkByBestScore(t *testing.T) {
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

	db := &persist.DB{}
	if err := db.NewDataBase(); err != nil {
		t.Fatalf("failed to run migrate: %v", err)
	}
	defer db.Close()
	
	benchmark_repo := &persist.BenchmarkRepositoryImpl{DB: db.DB}
	cpu_repo := &persist.CPURepositoryImpl{DB: db.DB}
	gpu_repo := &persist.GPURepositoryImpl{DB: db.DB}
	ram_repo := &persist.RAMMemoryRepositoryImpl{DB: db.DB}
	mother_board_repo := &persist.MotherBoardRepositoryImpl{DB: db.DB}
	powerSourceRepo := &persist.PowerSourceRepositoryImpl{DB: db.DB}
	ssdRepo := &persist.SSDRepositoryImpl{DB: db.DB}
	gameRepo := &persist.GameRepositoryImpl{DB: db.DB}
	
	svc := services.NewBuilderService(*benchmark_repo, 
		*cpu_repo, 
		*gpu_repo, 
		*ram_repo, 
		*mother_board_repo, 
		*powerSourceRepo, 
		*ssdRepo, 
		*gameRepo,
	)
		
	selectedBenchmarks, err := svc.GetBenchmarksByBestScore(ctx, benchmarks, "high")
	if err != nil{
		t.Fatalf("failed to get benchmarks by best score: %v", err)
	}

	is.Len(selectedBenchmarks, 1)

	for _, benchmark := range selectedBenchmarks {
		fmt.Printf("%v\n", benchmark)
	}
}
