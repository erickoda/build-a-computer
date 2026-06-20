package com.buildpc.benchmark_service.mapper;

import com.buildpc.benchmark_service.entities.CPU;
import com.buildpc.benchmark_service.grpc.generated.CPUResponse;
import com.buildpc.benchmark_service.grpc.generated.CreateCPURequest;
import com.buildpc.benchmark_service.grpc.generated.DeleteCPUResponse;
import com.buildpc.benchmark_service.grpc.generated.ListCPUResponse;
import com.buildpc.benchmark_service.grpc.generated.UpdateCPURequest;
import com.google.protobuf.ByteString;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
public class CPUMapper {

    public CPUResponse toProto(CPU cpu) {
        CPUResponse.Builder builder = CPUResponse.newBuilder()
                .setId(String.valueOf(cpu.getId()))
                .setBrand(cpu.getBrand())
                .setGen(cpu.getGen())
                .setFamily(cpu.getFamily())
                .setSeries(cpu.getSeries())
                .setCores(cpu.getCores())
                .setThreads(cpu.getThreads())
                .setBaseClock(cpu.getBaseClock())
                .setMaxClock(cpu.getMaxClock())
                .setCache(cpu.getCache())
                .setSocket(cpu.getSocket())
                .setGraphics(cpu.getGraphics())
                .setOc(cpu.getOc())
                .setRecommendedPower(cpu.getRecommendedPower())
                .setAvgPrice(cpu.getAvgPrice())
                .setReleaseDate(dateToTimestamp(cpu.getReleaseDate()))
                .setCreatedAt(dateToTimestamp(cpu.getCreatedAt()));

        if (cpu.getImg() != null) {
            builder.setImg(ByteString.copyFrom(cpu.getImg()));
        }
        if (cpu.getUpdatedAt() != null) {
            builder.setUpdatedAt(dateToTimestamp(cpu.getUpdatedAt()));
        }

        return builder.build();
    }

    public ListCPUResponse createListCPUResponse(List<CPUResponse> cpuResponses) {
        return ListCPUResponse.newBuilder()
                .addAllCpu(cpuResponses)
                .build();
    }

    public DeleteCPUResponse createDeleteCPUResponse(boolean deletedSuccess) {
        return DeleteCPUResponse.newBuilder()
                .setSuccess(deletedSuccess)
                .build();
    }

    public CPU toEntity(CreateCPURequest request) {
        CPU cpu = new CPU();
        cpu.setBrand(request.getBrand());
        cpu.setGen(request.getGen());
        cpu.setFamily(request.getFamily());
        cpu.setSeries(request.getSeries());
        cpu.setCores(request.getCores());
        cpu.setThreads(request.getThreads());
        cpu.setBaseClock(request.getBaseClock());
        cpu.setMaxClock(request.getMaxClock());
        cpu.setCache(request.getCache());
        cpu.setSocket(request.getSocket());
        cpu.setGraphics(request.getGraphics());
        cpu.setOc(request.getOc());
        cpu.setRecommendedPower(request.getRecommendedPower());
        cpu.setAvgPrice(request.getAvgPrice());
        cpu.setReleaseDate(timestampToDate(request.getReleaseDate()));

        if (request.hasImg()) {
            cpu.setImg(request.getImg().toByteArray());
        }

        return cpu;
    }

    public CPU toEntity(UpdateCPURequest request) {
        CPU cpu = new CPU();
        cpu.setBrand(request.getBrand());
        cpu.setGen(request.getGen());
        cpu.setFamily(request.getFamily());
        cpu.setSeries(request.getSeries());
        cpu.setCores(request.getCores());
        cpu.setThreads(request.getThreads());
        cpu.setBaseClock(request.getBaseClock());
        cpu.setMaxClock(request.getMaxClock());
        cpu.setCache(request.getCache());
        cpu.setSocket(request.getSocket());
        cpu.setGraphics(request.getGraphics());
        cpu.setOc(request.getOc());
        cpu.setRecommendedPower(request.getRecommendedPower());
        cpu.setAvgPrice(request.getAvgPrice());
        cpu.setReleaseDate(timestampToDate(request.getReleaseDate()));

        if (request.hasImg()) {
            cpu.setImg(request.getImg().toByteArray());
        }

        return cpu;
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