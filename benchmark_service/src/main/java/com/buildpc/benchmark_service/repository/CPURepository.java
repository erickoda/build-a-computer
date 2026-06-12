package com.buildpc.benchmark_service.repository;

import com.buildpc.benchmark_service.entities.CPU;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CPURepository extends JpaRepository<CPU, UUID> {
}
