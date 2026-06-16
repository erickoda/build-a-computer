package com.buildpc.benchmark_service.mapper;

import com.buildpc.benchmark_service.entities.Game;
import com.buildpc.benchmark_service.grpc.generated.GameResponse;
import com.google.protobuf.ByteString;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
public class GameMapper {
    public GameResponse createGameResponse(Game game) {
        GameResponse.Builder builder = GameResponse.newBuilder()
                .setId(String.valueOf(game.getId()))
                .setName(game.getName())
                .setNecessaryDisk(game.getNecessaryDiskSpace())
                .setCreatedAt(dateToTimestamp(game.getCreatedAt()));

        if(game.getImage() != null) {
            builder.setImg(ByteString.copyFrom(game.getImage()));
        }

        if(game.getUpdatedAt() != null) {
            builder.setUpdatedAt(dateToTimestamp(game.getUpdatedAt()));
        }

        return builder.build();
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
