package ports

import (
	model "github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
)

type BuilderPort interface {
	GetBenchmarksByHavierGame(games []string) []model.Benchmark
	GetBenchmarkByBestScore([]model.Benchmark) []model.Benchmark
	GetMotherBoardBySocketAndPCIEAndDDRAndPrice(socket string, pcie string, ddr string, price float32) []model.MotherBoard
}
