package com.buildpc.benchmark_service.mapper;

import com.buildpc.benchmark_service.entities.CPU;
import com.buildpc.benchmark_service.grpc.generated.CPUResponse;
import com.buildpc.benchmark_service.grpc.generated.CreateCPURequest;
import com.google.protobuf.ByteString;
import com.google.protobuf.Timestamp;
import org.springframework.stereotype.Component;

import java.sql.Date;

@Component
public class CPUMapper {

    public CPUResponse toProto(CPU cpu) {
        CPUResponse.Builder builder = CPUResponse.newBuilder()
                .setId(String.valueOf(cpu.getId()))
                .setBrand(cpu.getBrand())
                .setGen(cpu.getGeneration())
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
                .setAvgPrice(cpu.getAveragePrice())
                .setReleaseDate(dateToTimestamp(cpu.getReleaseDate()))
                .setCreatedAt(dateToTimestamp(cpu.getCreatedAt()));

        if (cpu.getImage() != null) {
            builder.setImg(ByteString.copyFrom(cpu.getImage()));
        }
        if (cpu.getUpdatedAt() != null) {
            builder.setUpdatedAt(dateToTimestamp(cpu.getUpdatedAt()));
        }

        return builder.build();
    }

    public CPU toEntity(CreateCPURequest request) {
        CPU cpu = new CPU();
        cpu.setBrand(request.getBrand());
        cpu.setGeneration(request.getGen());
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
        cpu.setAveragePrice(request.getAvgPrice());
        cpu.setReleaseDate(timestampToDate(request.getReleaseDate()));

        if (request.hasImg()) {
            cpu.setImage(request.getImg().toByteArray());
        }

        return cpu;
    }

    private Timestamp dateToTimestamp(Date dateTime) {
        return Timestamp.newBuilder()
                .setSeconds(dateTime.getTime() / 1000)
                .build();
    }

    private Date timestampToDate(Timestamp timestamp) {
		return new Date(timestamp.getSeconds());
    }
}