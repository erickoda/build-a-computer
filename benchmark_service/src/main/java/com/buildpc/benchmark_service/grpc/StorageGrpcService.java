package com.buildpc.benchmark_service.grpc;

import com.buildpc.benchmark_service.entities.Storage;
import com.buildpc.benchmark_service.exceptions.storage.DuplicatedStorageException;
import com.buildpc.benchmark_service.exceptions.storage.StorageNotFoundException;
import com.buildpc.benchmark_service.grpc.generated.*;
import com.buildpc.benchmark_service.mapper.StorageMapper;
import com.buildpc.benchmark_service.services.StorageService;
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
public class StorageGrpcService extends SSDServiceGrpc.SSDServiceImplBase {
    private final StorageService storageService;
    private final StorageMapper storageMapper;

    @Override
    public void createSSD(CreateSSDRequest request, StreamObserver<SSDResponse> responseObserver) {
        log.info("gRPC Create storage/ssd called");

        try{
            Storage storage = storageMapper.toEntity(request);

            Storage savedStorage = storageService.saveStorage(storage);

            responseObserver.onNext(storageMapper.toProto(savedStorage));
            responseObserver.onCompleted();
        }
        catch(DuplicatedStorageException e) {
            responseObserver.onError(Status.ALREADY_EXISTS
                    .withDescription(e.getMessage() +
                            request.getBrand() +
                            request.getSeries() +
                            request.getAmount()
                    ).asException());
        }
        catch (IllegalArgumentException e) {
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription(e.getMessage())
                    .asException()
            );
        }
        catch(Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }

    @Override
    public void listSSDs(ListSSDRequest request, StreamObserver<ListSSDResponse> responseObserver) {
        log.info("gRPC List storages called");

        try{
            List<Storage> SSDs = storageService.searchAll();

            List<SSDResponse> SSDsMappedToProto = SSDs.stream()
                    .map(storageMapper::toProto)
                    .toList();

            responseObserver.onNext(storageMapper.createListStorageResponse(SSDsMappedToProto));
            responseObserver.onCompleted();
        }
        catch(StorageNotFoundException e){
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch(IllegalArgumentException e){
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch(Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }

    @Override
    public void deleteSSD(DeleteSSDRequest request, StreamObserver<DeleteSSDResponse> responseObserver) {
        log.info("gRPC Delete by ID storage called");

        try{
            storageService.deleteById(UUID.fromString(request.getId()));

            responseObserver.onNext(storageMapper.createDeleteSSDResponse(true));
            responseObserver.onCompleted();
        }
        catch(StorageNotFoundException e){
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch(IllegalArgumentException e){
            responseObserver.onError(Status.INVALID_ARGUMENT
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
