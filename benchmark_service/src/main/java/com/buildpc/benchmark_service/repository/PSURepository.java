package com.buildpc.benchmark_service.repository;

import com.buildpc.benchmark_service.entities.PSU;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PSURepository extends JpaRepository<PSU, UUID> {
}
