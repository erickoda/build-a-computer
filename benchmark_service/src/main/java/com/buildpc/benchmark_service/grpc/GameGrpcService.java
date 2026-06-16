package com.buildpc.benchmark_service.grpc;

import com.buildpc.benchmark_service.entities.CPU;
import com.buildpc.benchmark_service.entities.Game;
import com.buildpc.benchmark_service.exceptions.cpu.CPUNotFoundException;
import com.buildpc.benchmark_service.exceptions.game.DuplicatedGameException;
import com.buildpc.benchmark_service.exceptions.game.GameNotFoundException;
import com.buildpc.benchmark_service.grpc.generated.*;
import com.buildpc.benchmark_service.mapper.GameMapper;
import com.buildpc.benchmark_service.services.GameService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.grpc.server.service.GrpcService;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Setter
@Slf4j
@GrpcService
@RequiredArgsConstructor
@Transactional
public class GameGrpcService extends GameServiceGrpc.GameServiceImplBase {
    private final GameService gameService;
    private final GameMapper gameMapper;

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
                    .withDescription(e.getMessage() +
                            request.getName() +
                            request.getNecessaryDisk()
                    )
                    .asException()
            );
        }
        catch (Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException()
            );
        }
    }

    @Override
    public void getGame(GetGameRequest request, StreamObserver<GameResponse> responseObserver) {
        log.info("gRPC get CPU called");

        try{
            Game foundGame = gameService.searchById(UUID.fromString(request.getId()));

            responseObserver.onNext(gameMapper.createGameResponse(foundGame));
            responseObserver.onCompleted();
        }
        catch (GameNotFoundException e) {
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
    public void listGames(ListGameRequest request, StreamObserver<ListGameResponse> responseObserver) {
        log.info("gRPC List game called");

        try{
            List<Game> foundGames = gameService.searchAll();

            List<GameResponse> gamesMappedToProto = foundGames.stream()
                    .map(gameMapper::createGameResponse)
                    .toList();

            responseObserver.onNext(gameMapper.createListGameResponse(gamesMappedToProto));
            responseObserver.onCompleted();
        }
        catch(GameNotFoundException e) {
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asException()
            );
        }
        catch(Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException()
            );
        }
    }

    @Override
    public void deleteGame(DeleteGameRequest request, StreamObserver<DeleteGameResponse> responseObserver) {
        log.info("gRPC delete agme called");

        try {
            gameService.deleteById(UUID.fromString(request.getId()));

            responseObserver.onNext(gameMapper.createDeleteGameResponse(true));
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
