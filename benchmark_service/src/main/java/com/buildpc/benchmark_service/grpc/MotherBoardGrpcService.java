package com.buildpc.benchmark_service.grpc;

import com.buildpc.benchmark_service.entities.MotherBoard;
import com.buildpc.benchmark_service.exceptions.motherBoard.DuplicatedMotherBoardException;
import com.buildpc.benchmark_service.exceptions.motherBoard.MotherBoardNotFoundException;
import com.buildpc.benchmark_service.grpc.generated.*;
import com.buildpc.benchmark_service.mapper.MotherBoardMapper;
import com.buildpc.benchmark_service.services.MotherBoardService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.grpc.server.service.GrpcService;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@GrpcService
@RequiredArgsConstructor
@Transactional
public class MotherBoardGrpcService extends MotherBoardServiceGrpc.MotherBoardServiceImplBase {
    private final MotherBoardService motherBoardService;
    private final MotherBoardMapper motherBoardMapper;

    @Override
    public void createMotherBoard(CreateMotherBoardRequest request, StreamObserver<MotherBoardResponse> responseObserver) {
        log.info("gRPC Create Mother Board called");

        try{
            MotherBoard mb = motherBoardMapper.toEntity(request);

            MotherBoard mbSaved = motherBoardService.save(mb);

            responseObserver.onNext(motherBoardMapper.toProto(mbSaved));
            responseObserver.onCompleted();
        }
        catch(DuplicatedMotherBoardException e){
            responseObserver.onError(Status.ALREADY_EXISTS
                    .withDescription(e.getMessage() +
                            request.getBrand() +
                            request.getSeries() +
                            request.getSocket() +
                            request.getDdr()
                    ).asException()
            );
        }
        catch(Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }

    @Override
    public void deleteMotherBoard(DeleteMotherBoardRequest request, StreamObserver<DeleteMotherBoardResponse> responseObserver) {
        log.info("gRPC Delete Mother Board called");

        try{
            motherBoardService.deleteById(UUID.fromString(request.getId()));

            responseObserver.onNext(motherBoardMapper.createDeleteMotherBoardResponse(true));
            responseObserver.onCompleted();
        }
        catch(MotherBoardNotFoundException e){
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch(Exception e){
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }
}
