package com.buildpc.benchmark_service.grpc;

import com.buildpc.benchmark_service.entities.PSU;
import com.buildpc.benchmark_service.exceptions.psu.DuplicatedPSUException;
import com.buildpc.benchmark_service.exceptions.psu.PSUNotFoundException;
import com.buildpc.benchmark_service.grpc.generated.*;
import com.buildpc.benchmark_service.mapper.PSUMapper;
import com.buildpc.benchmark_service.services.PSUService;
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
public class PSUGrpcService extends PSUServiceGrpc.PSUServiceImplBase {
    private final PSUService psuService;
    private final PSUMapper psuMapper;

    @Override
    public void createPSU(CreatePSURequest request, StreamObserver<PSUResponse> responseObserver) {
        log.info("gRPC Create PSU called");

        try {
            PSU psu = psuMapper.toEntity(request);

            PSU savedPSU = psuService.savePSU(psu);

            responseObserver.onNext(psuMapper.toProto(savedPSU));
            responseObserver.onCompleted();
        } catch (DuplicatedPSUException e) {
            responseObserver.onError(Status.ALREADY_EXISTS
                    .withDescription(e.getMessage() +
                            request.getBrand() +
                            request.getSeries() +
                            request.getPowerAmount())
                    .asException());
        } catch (IllegalArgumentException e) {
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription(e.getMessage())
                    .asException());
        } catch (Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }

    @Override
    public void listPSUs(ListPSURequest request, StreamObserver<ListPSUResponse> responseObserver) {
        try {
            List<PSU> foundPsu = psuService.searchAll();

            List<PSUResponse> PSUMappedToProto = foundPsu.stream()
                    .map(psuMapper::toProto)
                    .toList();

            responseObserver.onNext(psuMapper.createListPSUResponse(PSUMappedToProto));
            responseObserver.onCompleted();
        } catch (PSUNotFoundException e) {
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asException());
        } catch (IllegalArgumentException e) {
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription(e.getMessage())
                    .asException());
        } catch (Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }

    @Override
    public void deletePSU(DeletePSURequest request, StreamObserver<DeletePSUResponse> responseObserver) {
        log.info("gRPC Delete PSU called");

        try {
            psuService.deleteById(UUID.fromString(request.getId()));

            responseObserver.onNext(psuMapper.createDeletePSUResponse(true));
            responseObserver.onCompleted();
        } catch (PSUNotFoundException e) {
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asException());
        } catch (IllegalArgumentException e) {
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription(e.getMessage())
                    .asException());
        } catch (Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }
}
