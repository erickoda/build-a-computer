package com.buildpc.benchmark_microservice.repository;

import com.buildpc.benchmark_microservice.entities.Storage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StorageRepository extends JpaRepository<Storage, UUID> {
    boolean existsByBrandAndSeriesAndAmount(String brand, String series, Integer amount);
}
