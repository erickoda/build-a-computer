package db

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"github.com/google/uuid"
)

type BenchmarkRpository interface {
	FindBenchmarksByHavierGame(ctx context.Context, games []string) ([]models.Benchmark, error)
}

type BenchmarkRepository struct {
	DB *gorm.DB
}

func (r *BenchmarkRepository) FindBenchmarksByHavierGame(
	ctx context.Context, games []uuid.UUID, resolution int32,
) ([]models.Benchmark, error) {
	
	var benchmarks []models.Benchmark

	sub_query := r.DB.WithContext(ctx).
		Model(&models.Benchmark{}).
		Select("game_id").
		Where("game_id IN ? AND resolution = ?", games, resolution).
		Group("game_id").
		Order("AVG(avg_fps) ASC").
		Limit(1)
	fmt.Println(sub_query.Statement.Vars...)
	
	err := r.DB.WithContext(ctx).
		Where("game_id = (?) AND resolution = ?", sub_query, resolution).
		Find(&benchmarks).Error
	if err != nil {
		return nil, err
	}
	
	return benchmarks, nil
}
