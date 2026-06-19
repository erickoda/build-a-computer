package com.buildpc.benchmark_service.repository;

import com.buildpc.benchmark_service.entities.Benchmark;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.UUID;

public interface BenchmarkRepository extends JpaRepository<Benchmark, UUID>,
                                                JpaSpecificationExecutor<Benchmark> {

    List<Benchmark> findAllByUserId(UUID userID);
}
