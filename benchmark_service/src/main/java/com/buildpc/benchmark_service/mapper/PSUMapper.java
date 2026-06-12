package com.buildpc.benchmark_service.mapper;

import com.buildpc.benchmark_service.entities.PSU;
import com.buildpc.benchmark_service.grpc.generated.PSUResponse;
import com.buildpc.benchmark_service.grpc.generated.CreatePSURequest;
import com.google.protobuf.ByteString;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.sql.Date;

@Component
public class PSUMapper {

    public PSUResponse toProto(PSU psu) {
        PSUResponse.Builder builder = PSUResponse.newBuilder()
                .setId(String.valueOf(psu.getId()))
                .setBrand(psu.getBrand())
                .setSeries(psu.getSeries())
                .setPowerAmount(psu.getPowerAmount())
                .setRanking(String.valueOf(psu.getRanking()))
                .setScore(psu.getScore())
                .setEightyPlusCert(psu.getCertification())
                .setAvgPrice(psu.getAveragePrice())
                .setCreatedAt(dateToTimestamp(psu.getCreatedAt()));

        if (psu.getImage() != null) {
            builder.setImg(ByteString.copyFrom(psu.getImage()));
        }
        if (psu.getUpdatedAt() != null) {
            builder.setUpdatedAt(dateToTimestamp(psu.getUpdatedAt()));
        }

        return builder.build();
    }

    public PSU toEntity(CreatePSURequest request) {
        PSU psu = new PSU();
        psu.setBrand(request.getBrand());
        psu.setSeries(request.getSeries());
        psu.setPowerAmount(request.getPowerAmount());
        psu.setRanking(PSU.PowerSourceRanking.valueOf(request.getRanking()));
        psu.setScore(request.getScore());
        psu.setCertification(request.getEightyPlusCert());
        psu.setAveragePrice(request.getAvgPrice());

        if (request.hasImg()) {
            psu.setImage(request.getImg().toByteArray());
        }

        return psu;
    }

    private Timestamp dateToTimestamp(Date dateTime) {
        return Timestamp.newBuilder()
                .setSeconds(dateTime.getTime() / 1000)
                .build();
    }
}