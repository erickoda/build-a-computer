package com.buildpc.benchmark_service.mapper;

import com.buildpc.benchmark_service.entities.Storage;
import com.buildpc.benchmark_service.grpc.generated.SSDResponse;
import com.buildpc.benchmark_service.grpc.generated.CreateSSDRequest;
import com.google.protobuf.ByteString;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.time.Instant;

@Component
public class StorageMapper {

    public SSDResponse toProto(Storage ssd) {
        SSDResponse.Builder builder = SSDResponse.newBuilder()
                .setId(String.valueOf(ssd.getId()))
                .setBrand(ssd.getBrand())
                .setSeries(ssd.getSeries())
                .setAmount(ssd.getAmount())
                .setType(String.valueOf(ssd.getType()))
                .setReading(ssd.getReading())
                .setWriting(ssd.getWriting())
                .setAvgPrice(ssd.getAvgPrice())
                .setScore(ssd.getScore())
                .setCreatedAt(dateToTimestamp(ssd.getCreatedAt()));

        if (ssd.getImg() != null) {
            builder.setImg(ByteString.copyFrom(ssd.getImg()));
        }
        if (ssd.getUpdatedAt() != null) {
            builder.setUpdatedAt(dateToTimestamp(ssd.getUpdatedAt()));
        }

        return builder.build();
    }

    public Storage toEntity(CreateSSDRequest request) {
        Storage ssd = new Storage();
        ssd.setBrand(request.getBrand());
        ssd.setSeries(request.getSeries());
        ssd.setAmount(request.getAmount());
        ssd.setType(Storage.SSDType.valueOf(request.getType()));
        ssd.setReading(request.getReading());
        ssd.setWriting(request.getWriting());
        ssd.setAvgPrice(request.getAvgPrice());
        ssd.setScore(request.getScore());

        if (request.hasImg()) {
            ssd.setImg(request.getImg().toByteArray());
        }

        return ssd;
    }

    private Timestamp dateToTimestamp(Date dateTime) {
        return Timestamp.newBuilder()
                .setSeconds(dateTime.getTime() / 1000)
                .build();
    }
}