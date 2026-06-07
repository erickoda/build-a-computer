package main

import (
	"log"
	"net"
	"os"

	pb "github.com/erickoda/build-a-computer/pc_builder_service/pkg/protos"
	"github.com/joho/godotenv"
	"google.golang.org/grpc"

	persist "github.com/erickoda/build-a-computer/pc_builder_service/internal/adapters/db"
	grpcHandler "github.com/erickoda/build-a-computer/pc_builder_service/internal/adapters/grpc"
	"github.com/erickoda/build-a-computer/pc_builder_service/internal/services"
)

var addr string

type Server struct {
	pb.BuilderServiceServer
}

func recoverServer(){
	if r := recover(); r != nil {
		log.Println("server recovered from panic:", r)
	}
}

func main() {
	err := godotenv.Load()
	if err != nil {
		panic("failed to load .env file: " + err.Error())
	}

	addr = os.Getenv("ADDR")

	lis, err := net.Listen("tcp", addr)
	if err != nil{
		log.Fatalf("Failed to listen: %v", err)
	}

	defer recoverServer()

	db := &persist.DB{}
	if err := db.NewDataBase(); err != nil {
		log.Fatal(err)
	}
	
	log.Println("database running...")
	defer db.Close()
	
	benchmarkRepository := persist.NewBenchmarkRepositoryImpl(db.Get())
	CPURepository := persist.NewCPURepositoryImpl(db.Get())
	GPURepository := persist.NewGPURepositoryImpl(db.Get())
	RAMRepository := persist.NewRAMMemoryRepositoryImpl(db.Get())
	motherBoardRepository := persist.NewMotherBoardRepositoryImpl(db.Get())
	powerSourceRepository := persist.NewPowerSourceRepositoryImpl(db.Get())
	SSDRepository := persist.NewSSDRepositoryImpl(db.Get())
	gameRepository := persist.NewGameRepositoryImpl(db.Get())

	builderService := services.NewBuilderService(
		*benchmarkRepository,
		*CPURepository,
		*GPURepository,
		*RAMRepository,
		*motherBoardRepository,
		*powerSourceRepository,
		*SSDRepository,
		*gameRepository,
	)

	buidlerHandler := grpcHandler.NewBuilderHandler(builderService)

	s := grpc.NewServer()

	pb.RegisterBuilderServiceServer(s, buidlerHandler)
	
	log.Println("gRPC server running on port 50051...")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}

