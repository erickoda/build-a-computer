package com.buildpc.benchmark_service.repository;

import com.buildpc.benchmark_service.entities.RAM;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RAMRepository extends JpaRepository<RAM, UUID> {
}
