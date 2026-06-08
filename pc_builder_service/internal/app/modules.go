package app

import (
	"context"
	"log"
	"net"
	"os"

	"go.uber.org/fx"

	pb "github.com/erickoda/build-a-computer/pc_builder_service/pkg/protos"
	"github.com/joho/godotenv"
	"google.golang.org/grpc"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/adapters/db"
	grpcHandler "github.com/erickoda/build-a-computer/pc_builder_service/internal/adapters/grpc"
	"github.com/erickoda/build-a-computer/pc_builder_service/internal/services"
)

var Module = fx.Options(
	fx.Provide(
		db.NewDataBase,
		
		db.NewBenchmarkRepositoryImpl,
		
		db.NewCPURepositoryImpl,
		
		db.NewGPURepositoryImpl,
		
		db.NewRAMMemoryRepositoryImpl,
		
		db.NewMotherBoardRepositoryImpl,
		
		db.NewPowerSourceRepositoryImpl,
		
		db.NewSSDRepositoryImpl,
		
		db.NewGameRepositoryImpl,
		
		services.NewBuilderService,
		
		grpcHandler.NewBuilderHandler,
		
		NewGRPCServer,
	),
	fx.Invoke(RegisterServer),
)

func NewGRPCServer() *grpc.Server {
	return grpc.NewServer()
}

func recoverServer(){
	if r := recover(); r != nil {
		log.Println("server recovered from panic:", r)
	}
}

func RegisterServer(
	lc fx.Lifecycle,
	server *grpc.Server,
	handler *grpcHandler.BuilderHandler,
) {

	pb.RegisterBuilderServiceServer(server, handler)

	err := godotenv.Load()
	if err != nil {
		panic("failed to load .env file: " + err.Error())
	}

	var addr string = os.Getenv("ADDR")

	lc.Append(fx.Hook{
		OnStart: func(ctx context.Context) error {
			lis, err := net.Listen("tcp", addr)
			if err != nil {
				return err
			}

			go func() {
				defer recoverServer()
				
				if err := server.Serve(lis); err != nil {
					log.Fatal(err)
				}
			}()

			log.Println("gRPC server running on port 50051...")
			return nil
		},
		OnStop: func(ctx context.Context) error {
			log.Println("gracefully stopping gRPC server...")
			server.GracefulStop()
			return nil
		},
	})
}