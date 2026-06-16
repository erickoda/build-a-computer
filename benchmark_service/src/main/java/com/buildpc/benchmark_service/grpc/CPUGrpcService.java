package com.buildpc.benchmark_service.grpc;

import com.buildpc.benchmark_service.entities.CPU;
import com.buildpc.benchmark_service.exceptions.cpu.CPUNotFoundException;
import com.buildpc.benchmark_service.exceptions.cpu.DuplicatedCPUException;
import com.buildpc.benchmark_service.grpc.generated.*;
import com.buildpc.benchmark_service.mapper.CPUMapper;
import com.buildpc.benchmark_service.services.CPUService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.grpc.server.service.GrpcService;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@GrpcService
@RequiredArgsConstructor
@Transactional
public class CPUGrpcService extends CPUServiceGrpc.CPUServiceImplBase{

    private final CPUService cpuService;
    private final CPUMapper cpuMapper;

    @Override
    public void createCPU(
            CreateCPURequest request,
            StreamObserver<CPUResponse> responseObserver
    ) {

        log.info("gRPC Create CPU called");

        try {
            CPU savedCPU = cpuService.saveCPU(cpuMapper.toEntity(request));
            responseObserver.onNext(cpuMapper.toProto(savedCPU));
            responseObserver.onCompleted();

        } catch(DuplicatedCPUException e) {
            responseObserver.onError(Status.ALREADY_EXISTS
                    .withDescription(e.getMessage() +
                            request.getBrand() +
                            request.getFamily() +
                            request.getSeries())
                    .asException()
            );
        } catch (Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }

    @Override
    public void getCPU(GetCPURequest request, StreamObserver<CPUResponse> responseObserver) {
        log.info("gRPC get CPU called");

        try{
            CPU foundCPU = cpuService.searchById(UUID.fromString(request.getId()));

            responseObserver.onNext(cpuMapper.toProto(foundCPU));
            responseObserver.onCompleted();
        }
        catch (CPUNotFoundException e) {
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch (Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }

    @Override
    public void listCPUs(ListCPURequest request, StreamObserver<ListCPUResponse> responseObserver) {
        log.info("gRPC List CPUs called");

        try {
            List<CPU> foundCPUs = cpuService.searchAll();

            List<CPUResponse> cpusMappedToProto = foundCPUs.stream()
                    .map(cpuMapper::toProto)
                    .toList();

            responseObserver.onNext(cpuMapper.createListCPUResponse(cpusMappedToProto));
            responseObserver.onCompleted();

        }
        catch (CPUNotFoundException e ) {
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch (Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }

    @Override
    public void deleteCPU(DeleteCPURequest request, StreamObserver<DeleteCPUResponse> responseObserver) {
        log.info("gRPC delete CPU called");

        try {
            cpuService.deleteById(UUID.fromString(request.getId()));

            responseObserver.onNext(cpuMapper.createDeleteCPUResponse(true));
            responseObserver.onCompleted();

        }
        catch(CPUNotFoundException e) {
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
