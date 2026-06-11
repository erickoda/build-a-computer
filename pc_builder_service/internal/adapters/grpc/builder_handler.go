package grpc

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/errors"
	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/models"
	"github.com/erickoda/build-a-computer/pc_builder_service/internal/domain/ports"
	pb "github.com/erickoda/build-a-computer/pc_builder_service/pkg/protos"

	"github.com/golang/protobuf/ptypes/timestamp"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type BuilderHandler struct{
	pb.UnimplementedBuilderServiceServer
	builderSvc ports.BuilderPort
}

func NewBuilderHandler(builderSvc ports.BuilderPort) *BuilderHandler {
	return &BuilderHandler{
		builderSvc: builderSvc,
	}
}

func (h *BuilderHandler) BuildPC(ctx context.Context, req *pb.BuildPCRequest) (*pb.BuildPCResponse, error) {
	var inPricePCs []models.PC
	log.Println("Chega aqui")
	benchmarkByHeavierGame, err := h.builderSvc.GetBenchmarksByHavierGame(ctx, req.Games, req.Resolution)
	if err != nil {
		return nil, h.handlerGRPCError(err)
	}

	log.Println("benchmarkByHeavierGame: ", benchmarkByHeavierGame)

	selectedBenchmarks, err := h.builderSvc.GetBenchmarksByBestScore(ctx, benchmarkByHeavierGame, req.ComputerPerformance)
	if err != nil {
		return nil, h.handlerGRPCError(err)
	}

	if len(selectedBenchmarks) == 0 {
		return &pb.BuildPCResponse{}, nil
	}

	log.Println("selectedBenchmarks: ", selectedBenchmarks)
	
	cpuSocketsOfEachBenchmark, err := h.builderSvc.GetBenchmarksSockets(ctx, selectedBenchmarks)
	if err != nil {
		return nil, h.handlerGRPCError(err)
	}

	ramDDROfEachBenchmark, err := h.builderSvc.GetBenchmarksDDRs(ctx, selectedBenchmarks)
	if err != nil {
		return nil, h.handlerGRPCError(err)
	}

	motherBoardsMappedBySocketAndDDROfEachBenchmark, err := h.builderSvc.GetMotherBoardBySocketAndDDR(
		ctx, 
		cpuSocketsOfEachBenchmark, 
		ramDDROfEachBenchmark, 
		selectedBenchmarks,
	)
	if err != nil {
		return nil, h.handlerGRPCError(err)
	}

	motherBoards, err := h.builderSvc.GetMotherBoardsByScore(
		ctx, 
		motherBoardsMappedBySocketAndDDROfEachBenchmark, 
		req.ComputerPerformance,
	)
	if err != nil {
		return nil, h.handlerGRPCError(err)
	}

	if len(motherBoards) == 0 {
		return &pb.BuildPCResponse{}, nil
	}

	powerSourcesMappedByBenchmarks, err := h.builderSvc.GetPowerSourcesByRecommendedPower(
		ctx, selectedBenchmarks,
	)
	if err != nil {
		return nil, h.handlerGRPCError(err)
	}

	powerSources, err := h.builderSvc.GetPowerSourcesByScore(
		ctx, 
		powerSourcesMappedByBenchmarks,
	)
	if err != nil {
		return nil, h.handlerGRPCError(err)
	}

	if len(powerSources) == 0 {
		return &pb.BuildPCResponse{}, nil
	}

	games, err := h.builderSvc.GetGameByID(ctx, req.Games)
	if err != nil {
		return nil, h.handlerGRPCError(err)
	}

	SSDsMappedByBenchmarks, err := h.builderSvc.GetSSDByMinimumNecessaryAmount(
		ctx, 
		games, 
		selectedBenchmarks,
	)
	if err != nil {
		return nil, h.handlerGRPCError(err)
	}

	SSDs, err := h.builderSvc.GetSSDByScore(
		ctx, 
		SSDsMappedByBenchmarks, 
		req.ComputerPerformance,
	)
	if err != nil {
		return nil, h.handlerGRPCError(err)
	}

	if len(SSDs) == 0 {
		return &pb.BuildPCResponse{}, nil
	}

	CPUs, err := h.builderSvc.GetCPUsByID(ctx, selectedBenchmarks)
	if err != nil {
		return nil, h.handlerGRPCError(err)
	}

	GPUs, err := h.builderSvc.GetGPUsByID(ctx, selectedBenchmarks)
	if err != nil {
		return nil, h.handlerGRPCError(err)
	}

	RAMs, err := h.builderSvc.GetRAMsByID(ctx, selectedBenchmarks)
	if err != nil {
		return nil, h.handlerGRPCError(err)
	}

	PCs := h.builderSvc.CreatePCs(
		CPUs,
		GPUs,
		RAMs,
		motherBoards,
		powerSources,
		SSDs,
	)

	if len(PCs) == 0 {
		return &pb.BuildPCResponse{}, nil
	}

	for _, pc := range PCs {
		if h.builderSvc.CheckIfPCCostsMoreThanRequested(pc, req.MaxPrice) {
			continue
		}
		
		inPricePCs = append(inPricePCs, pc)
	}

	return &pb.BuildPCResponse{
		Pc: h.convertPCsToProto(inPricePCs),
	}, nil
}

func (h *BuilderHandler) handlerGRPCError(err error) error {
	if errors.Is(err, domain.ErrBenchmarkNotFound) ||
		errors.Is(err, domain.ErrCPUNotFound) ||
		errors.Is(err, domain.ErrGameNotFound) ||
		errors.Is(err, domain.ErrGPUNotFound) ||
		errors.Is(err, domain.ErrMotherBoardNotFound) ||
		errors.Is(err, domain.ErrRAMNotFound) ||
		errors.Is(err, domain.ErrSSDNotFound) {
			
		return status.Errorf(codes.NotFound, "%s", err.Error())
	}

	if errors.Is(err, domain.ErrInvalidUUID) {
		return status.Errorf(codes.InvalidArgument, "%s", err.Error())
	}

	if errors.Is(err, domain.ErrTimedOut) {
		return status.Errorf(codes.DeadlineExceeded, "%s", err.Error())
	}

	if errors.Is(err, domain.ErrCanceled) {
		return status.Errorf(codes.Canceled, "%s", err.Error())
	}

	return status.Errorf(codes.Internal, "%s", err.Error())
}

func (h *BuilderHandler) convertPCsToProto(PCs []models.PC) []*pb.PC {
	if PCs == nil {
		return nil
	}
	
	pcProtos := make([]*pb.PC, 0, len(PCs))
	
	for _, pc := range PCs {
		pcProtos = append(pcProtos, &pb.PC{
			Cpu:           h.convertCPUToProto(&pc.CPU),
			Gpu:           h.convertGPUToProto(&pc.GPU),
			Ram:           h.convertRAMToProto(&pc.RAMMemory),
			MotherBoard:   h.convertMotherBoardToProto(&pc.MotherBoard),
			Psu:           h.convertPowerSourceToProto(&pc.PowerSource),
			Ssd:           h.convertSSDToProto(&pc.SSD),
		})
	}
	return pcProtos
}

func (h *BuilderHandler) convertCPUToProto(cpu *models.CPU) *pb.CPU {
	if cpu == nil {
		return nil
	}
	
	return &pb.CPU{
		Id: cpu.ID.String(),
		Brand: cpu.Brand,
		Gen: cpu.Gen,
		Family: cpu.Family,
		Series: cpu.Series,
		Cores: cpu.Cores,
		Threads: cpu.Threads,
		BaseClock: cpu.BaseClock,
		MaxClock: cpu.MaxClock,
		Cache: cpu.Cache,
		Socket: cpu.Socket,
		Graphics: cpu.Graphics,
		Oc: cpu.OC,
		RecommendedPower: cpu.RecommendedPower,
		AvgPrice: cpu.AvgPrice,
		Img: cpu.Img,
		ReleaseDate: convertTimestamp(cpu.ReleaseDate),
		CreatedAt: convertTimestamp(cpu.CreatedAt),
		UpdatedAt: convertTimestamp(cpu.UpdatedAt),
	}
}

func (h *BuilderHandler) convertGPUToProto(gpu *models.GPU) *pb.GPU {
	if gpu == nil {
		return nil
	}
	
	return &pb.GPU{
		Id: gpu.ID.String(),
		Brand: gpu.Brand,
		Family: gpu.Family,
		Series: gpu.Series,
		MemoryAmount: gpu.MemoryAmount,
		MemoryGen: gpu.MemoryGen,
		Cores: gpu.Cores,
		PciExpress: gpu.PciExpress,
		RecommendedPower: gpu.RecommendedPower,
		AvgPrice: gpu.AvgPrice,
		Img: gpu.Img,
		ReleaseDate: convertTimestamp(gpu.ReleaseDate),
		CreatedAt: convertTimestamp(gpu.CreatedAt),
		UpdatedAt: convertTimestamp(gpu.UpdatedAt),
	}
}

func (h *BuilderHandler) convertRAMToProto(ram *models.RamMemory) *pb.RAMMemory {
	if ram == nil {
		return nil
	}
	
	return &pb.RAMMemory{
		Id: ram.ID.String(),
		Brand: ram.Brand,
		Ddr: ram.DDR,
		MemoryAmount: ram.MemoryAmount,
		Series: ram.Series,
		AvgPrice: ram.AvgPrice,
		FrequencyMhz: ram.FrequencyMhz,
		Img: ram.Img,
		CreatedAt: convertTimestamp(ram.CreatedAt),
		UpdatedAt: convertTimestamp(ram.UpdatedAt),
	}
}

func (h *BuilderHandler) convertMotherBoardToProto(mb *models.MotherBoard) *pb.MotherBoard {
	if mb == nil {
		return nil
	}
	
	return &pb.MotherBoard{
		Id: mb.ID.String(),
		Brand: mb.Brand,
		Series: mb.Series,
		Socket: mb.Socket,
		Ddr: mb.DDR,
		MemorySlots: mb.MemorySlots,
		MaxRam: mb.MaxRam,
		MaxRamFrequencyMhz: mb.MaxRamMemoryFrequencyMhz ,
		M2Slots: mb.M2Slots,
		PciExpressX16: mb.PciExpress,
		Vrm: mb.Vrm,
		AvgPrice: mb.AvgPrice,
		Score: mb.Score,
		Img: mb.Img,
		CreatedAt: convertTimestamp(mb.CreatedAt),
		UpdatedAt: convertTimestamp(mb.UpdatedAt),
	}
}

func (h *BuilderHandler) convertPowerSourceToProto(psu *models.PowerSource) *pb.PowerSource {
	if psu == nil {
		return nil
	}

	return &pb.PowerSource{
		Id: psu.ID.String(),
		Brand: psu.Brand,
		Series: psu.Series,
		PowerAmount: psu.PowerAmount,
		Ranking: string(psu.Ranking),
		Score: psu.Score,
		EightyPlusCert: psu.EightyPlusCert,
		AvgPrice: psu.AvgPrice,
		Img: psu.Img,
		CreatedAt: convertTimestamp(psu.CreatedAt),
		UpdatedAt: convertTimestamp(psu.UpdatedAt),
	}
}

func (h *BuilderHandler) convertSSDToProto(ssd *models.SSD) *pb.SSD {
	if ssd == nil {
		return nil
	}

	return &pb.SSD{
		Id: ssd.ID.String(),
		Brand: ssd.Brand,
		Series: ssd.Series,
		Amount: ssd.Amount,
		Type: string(ssd.Type),
		Reading: ssd.Reading,
		Writing: ssd.Writing,
		AvgPrice: ssd.AvgPrice,
		Score: ssd.Score,
		Img: ssd.Img,
		CreatedAt: convertTimestamp(ssd.CreatedAt),
		UpdatedAt: convertTimestamp(ssd.UpdatedAt),
	}
}

func convertTimestamp(date time.Time) *timestamp.Timestamp {
	if date.IsZero() {
		return nil
	}

	protoTimestamp := timestamppb.New(date)
	return protoTimestamp
}
