package db

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"github.com/google/uuid"
)

type BenchmarkRpository interface {
	FindBenchmarksByHavierGame(ctx context.Context, games []string) []models.Benchmark
}

type BenchmarkRepository struct {
	DB *gorm.DB
}

func (r *BenchmarkRepository) FindBenchmarksByHavierGame(ctx context.Context, games []uuid.UUID, resolution int32) []models.Benchmark {
	var havier_game_id string
	var benchmarks []models.Benchmark

	r.DB.Select("game_id").Where("game_id IN ? AND resolution = ?", games, resolution).Group("game_id").Order("AVG(avg_fps) ASC").Table("benchmarks").Limit(1).Find(&havier_game_id)
	fmt.Println(havier_game_id)
	r.DB.Where("game_id = ?", havier_game_id).Find(&benchmarks)
	
	return benchmarks
}
