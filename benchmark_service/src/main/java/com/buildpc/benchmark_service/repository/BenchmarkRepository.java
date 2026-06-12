package com.buildpc.benchmark_service.repository;

import com.buildpc.benchmark_service.entities.Benchmark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BenchmarkRepository extends JpaRepository<Benchmark, UUID> {
}
