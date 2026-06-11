package com.buildpc.benchmark_service.repositories;

import com.buildpc.benchmark_service.entities.GPU;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GPURepository extends JpaRepository<GPU, UUID> {
}
