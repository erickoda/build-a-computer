package com.buildpc.benchmark_microservice.repository;

import com.buildpc.benchmark_microservice.entities.PSU;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PSURepository extends JpaRepository<PSU, UUID> {
    boolean existsByBrandAndSeries(String brand, String series);
}
