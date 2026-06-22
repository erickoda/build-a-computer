package com.buildpc.benchmark_microservice.mapper;

import com.buildpc.benchmark_microservice.entities.RAM;
import com.buildpc.benchmark_microservice.grpc.generated.DeleteRAMResponse;
import com.buildpc.benchmark_microservice.grpc.generated.ListRAMResponse;
import com.buildpc.benchmark_microservice.grpc.generated.RAMResponse;
import com.buildpc.benchmark_microservice.grpc.generated.CreateRAMRequest;
import com.buildpc.benchmark_microservice.grpc.generated.UpdateRAMRequest;
import com.google.protobuf.ByteString;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
public class RAMMapper {

    public RAMResponse toProto(RAM ram) {
        RAMResponse.Builder builder = RAMResponse.newBuilder()
                .setId(String.valueOf(ram.getId()))
                .setBrand(ram.getBrand())
                .setDdr(ram.getDdr())
                .setMemoryAmount(ram.getMemoryAmount())
                .setAvgPrice(ram.getAvgPrice())
                .setFrequencyMhz(ram.getFrequencyMhz())
                .setSeries(ram.getSeries())
                .setCreatedAt(dateToTimestamp(ram.getCreatedAt()));

        if (ram.getImg() != null) {
            builder.setImg(ByteString.copyFrom(ram.getImg()));
        }
        if (ram.getUpdatedAt() != null) {
            builder.setUpdatedAt(dateToTimestamp(ram.getUpdatedAt()));
        }

        return builder.build();
    }

    public ListRAMResponse createListRAMResponse(List<RAMResponse> ramResponses) {
        return ListRAMResponse.newBuilder()
                .addAllRam(ramResponses)
                .build();
    }

    public DeleteRAMResponse createDeleteRAMResponse(boolean deletedSuccess) {
        return DeleteRAMResponse.newBuilder()
                .setSuccess(deletedSuccess)
                .build();
    }

    public RAM toEntity(CreateRAMRequest request) {
        RAM ram = new RAM();
        ram.setBrand(request.getBrand());
        ram.setDdr(request.getDdr());
        ram.setMemoryAmount(request.getMemoryAmount());
        ram.setAvgPrice(request.getAvgPrice());
        ram.setFrequencyMhz(request.getFrequencyMhz());
        ram.setSeries(request.getSeries());

        if (request.hasImg()) {
            ram.setImg(request.getImg().toByteArray());
        }

        return ram;
    }

    public RAM toEntity(UpdateRAMRequest request) {
        RAM ram = new RAM();
        ram.setBrand(request.getBrand());
        ram.setDdr(request.getDdr());
        ram.setMemoryAmount(request.getMemoryAmount());
        ram.setAvgPrice(request.getAvgPrice());
        ram.setFrequencyMhz(request.getFrequencyMhz());
        ram.setSeries(request.getSeries());

        if (request.hasImg()) {
            ram.setImg(request.getImg().toByteArray());
        }

        return ram;
    }

    private Timestamp dateToTimestamp(LocalDateTime dateTime) {
        Instant instant = dateTime.atZone(ZoneId.systemDefault()).toInstant();

        return Timestamp.newBuilder()
                .setSeconds(instant.getEpochSecond())
                .setNanos(instant.getNano())
                .build();
    }
}
