package com.buildpc.benchmark_service.grpc;

import com.buildpc.benchmark_service.entities.GPU;
import com.buildpc.benchmark_service.exceptions.gpu.DuplicatedGPUException;
import com.buildpc.benchmark_service.exceptions.gpu.GPUNotFoundException;
import com.buildpc.benchmark_service.grpc.generated.*;
import com.buildpc.benchmark_service.mapper.GPUMapper;
import com.buildpc.benchmark_service.services.GPUService;
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
public class GPUGrpcService extends GPUServiceGrpc.GPUServiceImplBase {
    private final GPUService gpuService;
    private final GPUMapper gpuMapper;

    @Override
    public void createGPU(CreateGPURequest request, StreamObserver<GPUResponse> responseObserver) {
        log.info("gRPC Crate GPU called");

        try{
            GPU gpu = gpuMapper.toEntity(request);

            GPU savedGPU = gpuService.saveGPU(gpu);

            responseObserver.onNext(gpuMapper.toProto(savedGPU));
            responseObserver.onCompleted();
        }
        catch(DuplicatedGPUException e){
            responseObserver.onError(Status.ALREADY_EXISTS
                    .withDescription(e.getMessage() +
                            request.getBrand() +
                            request.getFamily() +
                            request.getSeries()
                    )
                    .asException()
            );
        }
        catch (Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }

    @Override
    public void listGPUs(ListGPURequest request, StreamObserver<ListGPUResponse> responseObserver) {
        log.info("gRPC List GPUs called");

        try{
            List<GPU> foundGPUs = gpuService.searchAll();

            List<GPUResponse> gpusMappedToProto = foundGPUs.stream()
                    .map(gpuMapper::toProto)
                    .toList();

            responseObserver.onNext(gpuMapper.createListGPUResponse(gpusMappedToProto));
            responseObserver.onCompleted();
        } catch(GPUNotFoundException e){
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch (Exception e){
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }
}
