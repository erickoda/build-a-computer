package com.buildpc.benchmark_service.mapper;

import com.buildpc.benchmark_service.entities.RAM;
import com.buildpc.benchmark_service.grpc.generated.RAMResponse;
import com.buildpc.benchmark_service.grpc.generated.CreateRAMRequest;
import com.google.protobuf.ByteString;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.sql.Date;

@Component
public class RAMMapper {

    public RAMResponse toProto(RAM ram) {
        RAMResponse.Builder builder = RAMResponse.newBuilder()
                .setId(String.valueOf(ram.getId()))
                .setBrand(ram.getBrand())
                .setDdr(ram.getDdr())
                .setMemoryAmount(ram.getMemoryAmount())
                .setAvgPrice(ram.getAveragePrice())
                .setFrequencyMhz(ram.getFrequency())
                .setSeries(ram.getSeries())
                .setCreatedAt(dateToTimestamp(ram.getCreatedAt()));

        if (ram.getImage() != null) {
            builder.setImg(ByteString.copyFrom(ram.getImage()));
        }
        if (ram.getUpdatedAt() != null) {
            builder.setUpdatedAt(dateToTimestamp(ram.getUpdatedAt()));
        }

        return builder.build();
    }

    public RAM toEntity(CreateRAMRequest request) {
        RAM ram = new RAM();
        ram.setBrand(request.getBrand());
        ram.setDdr(request.getDdr());
        ram.setMemoryAmount(request.getMemoryAmount());
        ram.setAveragePrice(request.getAvgPrice());
        ram.setFrequency(request.getFrequencyMhz());
        ram.setSeries(request.getSeries());

        if (request.hasImg()) {
            ram.setImage(request.getImg().toByteArray());
        }

        return ram;
    }

    private Timestamp dateToTimestamp(Date dateTime) {
        return Timestamp.newBuilder()
                .setSeconds(dateTime.getTime() / 1000)
                .build();
    }
}
