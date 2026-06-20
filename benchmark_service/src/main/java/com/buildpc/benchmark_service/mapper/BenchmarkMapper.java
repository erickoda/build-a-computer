package com.buildpc.benchmark_service.mapper;

import com.buildpc.benchmark_service.entities.Benchmark;
import com.buildpc.benchmark_service.entities.CPU;
import com.buildpc.benchmark_service.entities.GPU;
import com.buildpc.benchmark_service.entities.RAM;
import com.buildpc.benchmark_service.entities.valueObjects.Performance;
import com.buildpc.benchmark_service.grpc.generated.BenchmarkResponse;
import com.buildpc.benchmark_service.grpc.generated.CreateBenchmarkRequest;
import com.buildpc.benchmark_service.grpc.generated.DeleteBenchmarkResponse;
import com.buildpc.benchmark_service.grpc.generated.ListBenchmarkResponse;
import com.buildpc.benchmark_service.repository.*;
import com.google.protobuf.Timestamp;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
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
                .setGraphicsQuality(benchmark.getGraphicsQuality().toProtoValue())
                .setCpu(cpuMapper.toProto(benchmark.getCpu()))
                .setGpu(gpuMapper.toProto(benchmark.getGpu()))
                .setRam(ramMapper.toProto(benchmark.getRam()))
                .setAvgFps(benchmark.getAvgFPS())
                .setMinFps(benchmark.getMinFPS())
                .setMaxFps(benchmark.getMaxFPS())
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

    public ListBenchmarkResponse createListBenchmarkResponse(List<BenchmarkResponse> responses) {
        return ListBenchmarkResponse.newBuilder()
                .addAllBenchmark(responses)
                .build();
    }

    public DeleteBenchmarkResponse createDeleteBenchmarkResponse(boolean deletedSuccess) {
        return DeleteBenchmarkResponse.newBuilder()
                .setSuccess(deletedSuccess)
                .build();
    }

    public Benchmark toEntity(CreateBenchmarkRequest request) {
        // Resolve FK references — getReferenceById issues no SELECT, only sets the FK
        CPU cpu = cpuRepository.getReferenceById(UUID.fromString(request.getCpuId()));
        GPU gpu = gpuRepository.getReferenceById(UUID.fromString(request.getGpuId()));
        RAM ram = ramRepository.getReferenceById(UUID.fromString(request.getRamId()));

        Benchmark benchmark = new Benchmark();
        benchmark.setTitle(request.getTitle());
        benchmark.setResolution(request.getResolution());
        benchmark.setGraphicsQuality(Performance.fromDatabaseValue(request.getGraphicsQuality()));
        benchmark.setCpu(cpu);
        benchmark.setGpu(gpu);
        benchmark.setRam(ram);
        benchmark.setAvgFPS(request.getAvgFps());
        benchmark.setMinFPS(request.getMinFps());
        benchmark.setMaxFPS(request.getMaxFps());
        benchmark.setGame(gameRepository.getReferenceById(UUID.fromString(request.getGameId())));
        benchmark.setUserId(UUID.fromString(request.getUserId()));

        if (request.hasScore()) {
            benchmark.setScore(request.getScore());
        }

        return benchmark;
    }

    private Timestamp dateToTimestamp(LocalDateTime dateTime) {
        Instant instant = dateTime.atZone(ZoneId.systemDefault()).toInstant();

        return Timestamp.newBuilder()
                .setSeconds(instant.getEpochSecond())
                .setNanos(instant.getNano())
                .build();
    }
}