package db

import (
	"context"
	"fmt"
	"testing"

	"github.com/google/uuid"
)

 
func TestBenchmarkRepositoryFindBenchmarksByHavierGame(t *testing.T) {
	games := []uuid.UUID{
		uuid.MustParse("fbf6d75a-1555-43d8-b346-8866e975d66b"),
		uuid.MustParse("326261be-a55a-4b31-bc7f-c6b7dfd69a61"),
	}
	var resolution int32 = 1080
	ctx := context.Background()

	db, err := NewDataBase()
	if err != nil {
		t.Fatalf("failed to run migrate: %v", err)
	}

	benchmarkRepo := &BenchmarkRepositoryImpl{DB: db}
	benchmarks, err := benchmarkRepo.FindBenchmarksByHavierGame(ctx, games, resolution)
	if err != nil {
		t.Fatalf("failed to find benchmarks: %v", err)
	}
	
	if len(benchmarks) == 0 {
		t.Fatalf("expected benchmarks, got none")
	}
	for _, benchmark := range benchmarks {
		if benchmark.GameId != games[0] && benchmark.GameId != games[1] {
			t.Fatalf("expected game id to be one of %v, got %v", games, benchmark.GameId)
		}

		fmt.Println(benchmark)
	}
}

func TestMotherBoardRepositoryFindBySocketAndPCIEAndDDR(t *testing.T) {
	socket := "LGA1700"
	pcie := int32(5)
	ddr := "ddr4"
	ctx := context.Background()

	db, err := NewDataBase()
	if err != nil {
		t.Fatalf("failed to run migrate: %v", err)
	}

	motherBoardRepo := &MotherBoardRepositoryImpl{DB: db}
	motherBoards, err := motherBoardRepo.FindBySocketAndDDR(ctx, socket, ddr)
	if err != nil {
		t.Fatalf("failed to find mother boards: %v", err)
	}

	if len(motherBoards) == 0 {
		t.Fatalf("expected mother boards, got none")
	}
	for _, motherBoard := range motherBoards {
		if motherBoard.Socket != socket || motherBoard.PciExpress != pcie || motherBoard.DDR != ddr {
			t.Fatalf("expected socket %s, PCIExpress %d, DDR %s, got %s, %d, %s", socket, pcie, ddr, motherBoard.Socket, motherBoard.PciExpress, motherBoard.DDR)
		}

		fmt.Println(motherBoard)
	}
}

func TestPowerSourceRepositoryFindByRecommendedPower(t *testing.T) {
	ctx := context.Background()
	db, err := NewDataBase()
	if err != nil {
		t.Fatalf("failed to run migrate: %v", err)
	}

	powerSourceRepo := &PowerSourceRepositoryImpl{DB: db}
	powerSources, err := powerSourceRepo.FindByRecommendedPowerSource(ctx, []int32{650, 750})
	if err != nil {
		t.Fatalf("failed to find power sources: %v", err)
	}

	if len(powerSources) == 0 {
		t.Fatalf("expected power sources, got none")
	}
	for _, powerSource := range powerSources {
		fmt.Println(powerSource)
	}
}

func TestSDDRepositoryFindByMinimumAmount(t *testing.T) {
	ctx := context.Background()
	
	db, err := NewDataBase()
	if err != nil {
		t.Fatalf("failed to run migrate: %v", err)
	}

	ssdRepo := &SSDRepositoryImpl{DB: db}
	
	ssds, err := ssdRepo.FindByMinimumAmount(ctx, 356)
	if err != nil {
		t.Fatalf("failed to find SSDs: %v", err)
	}

	if len(ssds) == 0 {
		t.Fatalf("expected SSDs, got none")
	}
	for _, ssd := range ssds {
		fmt.Println(ssd)
	}
}