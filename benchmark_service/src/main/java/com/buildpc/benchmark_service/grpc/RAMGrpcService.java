package com.buildpc.benchmark_service.grpc;

import com.buildpc.benchmark_service.entities.RAM;
import com.buildpc.benchmark_service.exceptions.ram.RAMNotFoundException;
import com.buildpc.benchmark_service.grpc.generated.*;
import com.buildpc.benchmark_service.mapper.RAMMapper;
import com.buildpc.benchmark_service.services.RAMService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.grpc.server.service.GrpcService;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@GrpcService
@RequiredArgsConstructor
@Transactional
public class RAMGrpcService extends RAMServiceGrpc.RAMServiceImplBase {

    private final RAMService ramService;
    private final RAMMapper ramMapper;

    @Override
    public void createRAM(CreateRAMRequest request, StreamObserver<RAMResponse> responseObserver) {
        log.info("gRPC Create RAM called");

        try{
            RAM ram = ramMapper.toEntity(request);

            RAM savedRAM = ramService.saveRAM(ram);

            responseObserver.onNext(ramMapper.toProto(savedRAM));
            responseObserver.onCompleted();
        }
        catch (Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }

    @Override
    public void listRAMs(ListRAMRequest request, StreamObserver<ListRAMResponse> responseObserver) {
        log.info("gRPC List all RAMs called");

        try{
            List<RAM> foundRAMs = ramService.searchAll();

            List<RAMResponse> ramsMappedToProto = foundRAMs.stream()
                    .map(ramMapper::toProto)
                    .toList();

            responseObserver.onNext(ramMapper.createListRAMResponse(ramsMappedToProto));
            responseObserver.onCompleted();
        }
        catch(RAMNotFoundException e){
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch(Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }
}
