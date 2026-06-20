package com.buildpc.benchmark_service.mapper;

import com.buildpc.benchmark_service.entities.PSU;
import com.buildpc.benchmark_service.entities.valueObjects.PSURanking;
import com.buildpc.benchmark_service.grpc.generated.*;
import com.google.protobuf.ByteString;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

import java.util.List;

@Component
public class PSUMapper {

    public PSUResponse toProto(PSU psu) {
        PSUResponse.Builder builder = PSUResponse.newBuilder()
                .setId(String.valueOf(psu.getId()))
                .setBrand(psu.getBrand())
                .setSeries(psu.getSeries())
                .setPowerAmount(psu.getPowerAmount())
                .setRanking(psu.getRanking().toProtoValue())
                .setScore(psu.getScore())
                .setEightyPlusCert(psu.getEightyPlusCert())
                .setAvgPrice(psu.getAvgPrice())
                .setCreatedAt(dateToTimestamp(psu.getCreatedAt()));

        if (psu.getImg() != null) {
            builder.setImg(ByteString.copyFrom(psu.getImg()));
        }
        if (psu.getUpdatedAt() != null) {
            builder.setUpdatedAt(dateToTimestamp(psu.getUpdatedAt()));
        }

        return builder.build();
    }

    public ListPSUResponse createListPSUResponse(List<PSUResponse> psuResponses) {
        return ListPSUResponse.newBuilder()
                .addAllPsu(psuResponses)
                .build();
    }

    public DeletePSUResponse createDeletePSUResponse(boolean deletedSuccess) {
        return DeletePSUResponse.newBuilder()
                .setSuccess(deletedSuccess)
                .build();
    }

    public PSU toEntity(CreatePSURequest request) {
        PSU psu = new PSU();
        psu.setBrand(request.getBrand());
        psu.setSeries(request.getSeries());
        psu.setPowerAmount(request.getPowerAmount());
        psu.setRanking(PSURanking.fromDatabaseValue(request.getRanking()));
        psu.setScore(request.getScore());
        psu.setEightyPlusCert(request.getEightyPlusCert());
        psu.setAvgPrice(request.getAvgPrice());

        if (request.hasImg()) {
            psu.setImg(request.getImg().toByteArray());
        }

        return psu;
    }

    public PSU toEntity(UpdatePSURequest request) {
        PSU psu = new PSU();
        psu.setBrand(request.getBrand());
        psu.setSeries(request.getSeries());
        psu.setPowerAmount(request.getPowerAmount());
        psu.setRanking(PSURanking.fromDatabaseValue(request.getRanking()));
        psu.setScore(request.getScore());
        psu.setEightyPlusCert(request.getEightyPlusCert());
        psu.setAvgPrice(request.getAvgPrice());

        if (request.hasImg()) {
            psu.setImg(request.getImg().toByteArray());
        }

        return psu;
    }

    private Timestamp dateToTimestamp(LocalDateTime dateTime) {
        Instant instant = dateTime.atZone(ZoneId.systemDefault()).toInstant();

        return Timestamp.newBuilder()
                .setSeconds(instant.getEpochSecond())
                .setNanos(instant.getNano())
                .build();
    }
}