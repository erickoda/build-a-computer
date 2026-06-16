package com.buildpc.benchmark_service.grpc;

import com.buildpc.benchmark_service.entities.Game;
import com.buildpc.benchmark_service.exceptions.game.DuplicatedGameException;
import com.buildpc.benchmark_service.grpc.generated.CreateGameRequest;
import com.buildpc.benchmark_service.grpc.generated.GameResponse;
import com.buildpc.benchmark_service.grpc.generated.GameServiceGrpc;
import com.buildpc.benchmark_service.mapper.GameMapper;
import com.buildpc.benchmark_service.services.GameService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.grpc.server.service.GrpcService;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@GrpcService
@RequiredArgsConstructor
@Transactional
public class GameGrpcService extends GameServiceGrpc.GameServiceImplBase {
    private GameService gameService;
    private GameMapper gameMapper;

    @Override
    public void createGame(CreateGameRequest request, StreamObserver<GameResponse> responseObserver) {
        log.info("gRPC Create game called");

        try{
            Game game = gameMapper.toEntity(request);

            Game savedGame = gameService.saveGame(game);
            responseObserver.onNext(gameMapper.createGameResponse(savedGame));
            responseObserver.onCompleted();
        }
        catch(DuplicatedGameException e) {
            responseObserver.onError(Status.ALREADY_EXISTS
                    .withDescription(e.getMessage())
                    .asException()
            );
        }
        catch (Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }
}
