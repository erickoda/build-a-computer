package ports

import (
	"context"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
)

type BenchmarkRepository interface {
	FindBenchmarksByHavierGame(ctx context.Context, games []string) ([]models.Benchmark, error)
}