package com.buildpc.benchmark_service.mapper;

import com.buildpc.benchmark_service.entities.Benchmark;
import com.buildpc.benchmark_service.entities.CPU;
import com.buildpc.benchmark_service.entities.GPU;
import com.buildpc.benchmark_service.entities.RAM;
import com.buildpc.benchmark_service.grpc.generated.BenchmarkResponse;
import com.buildpc.benchmark_service.grpc.generated.CreateBenchmarkRequest;
import com.buildpc.benchmark_service.repository.*;
import com.google.protobuf.Timestamp;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class BenchmarkMapper {

    private final CPUMapper cpuMapper;
    private final GPUMapper gpuMapper;
    private final RAMMapper ramMapper;

    private final CPURepository cpuRepository;
    private final GPURepository gpuRepository;
    private final RAMRepository ramRepository;
    private final GameRepository gameRepository;

    public BenchmarkResponse toProto(Benchmark benchmark) {
        BenchmarkResponse.Builder builder = BenchmarkResponse.newBuilder()
                .setId(String.valueOf(benchmark.getId()))
                .setTitle(benchmark.getTitle())
                .setResolution(benchmark.getResolution())
                .setGraphicsQuality(String.valueOf(benchmark.getGraphicsQuality()))
                .setCpu(cpuMapper.toProto(benchmark.getCpu()))
                .setGpu(gpuMapper.toProto(benchmark.getGpu()))
                .setRam(ramMapper.toProto(benchmark.getRam()))
                .setAvgFps(benchmark.getAverageFPS())
                .setMinFps(benchmark.getMinimumFPS())
                .setMaxFps(benchmark.getMaximumFPS())
                .setGameId(String.valueOf(benchmark.getGame().getId()))
                .setUserId(String.valueOf(benchmark.getUserId()))
                .setCreatedAt(dateToTimestamp(benchmark.getCreatedAt()));

        if (benchmark.getScore() != null) {
            builder.setScore(benchmark.getScore());
        }
        if (benchmark.getUpdatedAt() != null) {
            builder.setUpdatedAt(dateToTimestamp(benchmark.getUpdatedAt()));
        }

        return builder.build();
    }

    public Benchmark toEntity(CreateBenchmarkRequest request) {
        // Resolve FK references — getReferenceById issues no SELECT, only sets the FK
        CPU cpu = cpuRepository.getReferenceById(UUID.fromString(request.getCpuId()));
        GPU gpu = gpuRepository.getReferenceById(UUID.fromString(request.getGpuId()));
        RAM ram = ramRepository.getReferenceById(UUID.fromString(request.getRamId()));

        Benchmark benchmark = new Benchmark();
        benchmark.setTitle(request.getTitle());
        benchmark.setResolution(request.getResolution());
        benchmark.setGraphicsQuality(Benchmark.GraphicsQuality.valueOf(request.getGraphicsQuality()));
        benchmark.setCpu(cpu);
        benchmark.setGpu(gpu);
        benchmark.setRam(ram);
        benchmark.setAverageFPS(request.getAvgFps());
        benchmark.setMinimumFPS(request.getMinFps());
        benchmark.setMaximumFPS(request.getMaxFps());
        benchmark.setGame(gameRepository.getReferenceById(UUID.fromString(request.getGameId())));
        benchmark.setUserId(UUID.fromString(request.getUserId()));

        if (request.hasScore()) {
            benchmark.setScore(request.getScore());
        }

        return benchmark;
    }

    private Timestamp dateToTimestamp(Date dateTime) {
        return Timestamp.newBuilder()
                .setSeconds(dateTime.getTime() / 1000)
                .build();
    }
}