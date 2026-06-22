package ports

import (
	"context"

	"github.com/erickoda/build-a-computer/recommendation_microservice/internal/domain/models"
)

// BenchmarkRepository defines the interface for the benchmark repository.
type BenchmarkRepository interface {
	FindBenchmarksByHavierGame(ctx context.Context, games []string) ([]models.Benchmark, error)
}