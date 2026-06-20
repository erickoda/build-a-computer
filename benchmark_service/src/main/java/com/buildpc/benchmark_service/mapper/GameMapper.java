package com.buildpc.benchmark_service.mapper;

import com.buildpc.benchmark_service.entities.Game;
import com.buildpc.benchmark_service.grpc.generated.*;
import com.google.protobuf.ByteString;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
public class GameMapper {
    public GameResponse createGameResponse(Game game) {
        GameResponse.Builder builder = GameResponse.newBuilder()
                .setId(String.valueOf(game.getId()))
                .setName(game.getName())
                .setNecessaryDisk(game.getNecessaryDisk())
                .setCreatedAt(dateToTimestamp(game.getCreatedAt()));

        if (game.getImg() != null) {
            builder.setImg(ByteString.copyFrom(game.getImg()));
        }

        if (game.getUpdatedAt() != null) {
            builder.setUpdatedAt(dateToTimestamp(game.getUpdatedAt()));
        }

        return builder.build();
    }

    public ListGameResponse createListGameResponse(List<GameResponse> gameResponses) {
        return ListGameResponse.newBuilder()
                .addAllGames(gameResponses)
                .build();
    }

    public DeleteGameResponse createDeleteGameResponse(boolean deletedSuccess) {
        return DeleteGameResponse.newBuilder()
                .setSuccess(deletedSuccess)
                .build();
    }

    public Game toEntity(CreateGameRequest request) {
        Game game = new Game();

        game.setName(request.getName());
        game.setNecessaryDisk(request.getNecessaryDisk());

        if (request.hasImg())
            game.setImg(request.getImg().toByteArray());

        return game;
    }

    private Timestamp dateToTimestamp(LocalDateTime dateTime) {
        Instant instant = dateTime.atZone(ZoneId.systemDefault()).toInstant();

        return Timestamp.newBuilder()
                .setSeconds(instant.getEpochSecond())
                .setNanos(instant.getNano())
                .build();
    }

    private LocalDateTime timestampToDate(Timestamp timestamp) {
        Instant instant = Instant.ofEpochSecond(timestamp.getSeconds(), timestamp.getNanos());

        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault());
    }
}
