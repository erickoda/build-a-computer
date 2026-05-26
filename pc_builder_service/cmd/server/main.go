package main

import (
	"log"
	"net"
	"os"

	pb "github.com/erickoda/build-a-computer/pc_builder_service/pkg/protos"
	"google.golang.org/grpc"
)

var addr string = os.Getenv("ADDR")

type Server struct {
	pb.BuilderServiceServer
}

func main() {
	lis, err := net.Listen("tcp", addr)
	if err != nil{
		log.Fatalf("Failed to listen: %v", err)
	}

	s := grpc.NewServer()

	pb.RegisterBuilderServiceServer(s, Server{})
	
	log.Println("gRPC server running on port 50051...")
	if err := s.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}

