package db

import (
	"context"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"github.com/google/uuid"
)

type BenchmarkRepositoryImpl struct {
	DB *DB
}

func NewBenchmarkRepositoryImpl(db *DB) *BenchmarkRepositoryImpl {
	return &BenchmarkRepositoryImpl{DB: db}
}

func (r *BenchmarkRepositoryImpl) FindBenchmarksByHavierGame(
	ctx context.Context, games []uuid.UUID, resolution int32,
) ([]models.Benchmark, error) {
	
	var benchmarks []models.Benchmark

	sub_query := r.DB.Gorm.WithContext(ctx).
		Model(&models.Benchmark{}).
		Select("game_id").
		Where("game_id IN ? AND resolution = ?", games, resolution).
		Group("game_id").
		Order("AVG(avg_fps) ASC").
		Limit(1)
	
	err := r.DB.Gorm.WithContext(ctx).
		Where("game_id = (?) AND resolution = ?", sub_query, resolution).
		Find(&benchmarks).Error
	if err != nil {
		err = HandleError(err, "benchmark")
		return nil, err
	}
	
	return benchmarks, nil
}
