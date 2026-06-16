package com.buildpc.benchmark_service.mapper;

import com.buildpc.benchmark_service.entities.GPU;
import com.buildpc.benchmark_service.grpc.generated.GPUResponse;
import com.buildpc.benchmark_service.grpc.generated.CreateGPURequest;
import com.buildpc.benchmark_service.grpc.generated.ListGPUResponse;
import com.google.protobuf.ByteString;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
public class GPUMapper {

    public GPUResponse toProto(GPU gpu) {
        GPUResponse.Builder builder = GPUResponse.newBuilder()
                .setId(String.valueOf(gpu.getId()))
                .setBrand(gpu.getBrand())
                .setFamily(gpu.getFamily())
                .setSeries(gpu.getSeries())
                .setMemoryAmount(gpu.getMemoryAmount())
                .setMemoryGen(gpu.getMemoryGeneration())
                .setCores(gpu.getCores())
                .setPciExpress(gpu.getPciExpress())
                .setRecommendedPower(gpu.getRecommenderPower())
                .setAvgPrice(gpu.getAveragePrice())
                .setReleaseDate(dateToTimestamp(gpu.getReleaseDate()))
                .setCreatedAt(dateToTimestamp(gpu.getCreatedAt()));

        if (gpu.getImage() != null) {
            builder.setImg(ByteString.copyFrom(gpu.getImage()));
        }
        if (gpu.getUpdatedAt() != null) {
            builder.setUpdatedAt(dateToTimestamp(gpu.getUpdatedAt()));
        }

        return builder.build();
    }

    public ListGPUResponse createListGPUResponse(List<GPUResponse> gpuResponses){
        return ListGPUResponse.newBuilder()
                .addAllGpu(gpuResponses)
                .build();
    }

    public GPU toEntity(CreateGPURequest request) {
        GPU gpu = new GPU();
        gpu.setBrand(request.getBrand());
        gpu.setFamily(request.getFamily());
        gpu.setSeries(request.getSeries());
        gpu.setMemoryAmount(request.getMemoryAmount());
        gpu.setMemoryGeneration(request.getMemoryGen());
        gpu.setCores(request.getCores());
        gpu.setPciExpress(request.getPciExpress());
        gpu.setRecommenderPower(request.getRecommendedPower());
        gpu.setAveragePrice(request.getAvgPrice());
        gpu.setReleaseDate(timestampToDate(request.getReleaseDate()));

        if (request.hasImg()) {
            gpu.setImage(request.getImg().toByteArray());
        }

        return gpu;
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