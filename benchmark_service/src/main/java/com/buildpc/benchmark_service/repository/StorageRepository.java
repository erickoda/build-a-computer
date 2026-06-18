package com.buildpc.benchmark_service.repository;

import com.buildpc.benchmark_service.entities.Storage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StorageRepository extends JpaRepository<Storage, UUID> {
    boolean existsByBrandAndSeriesAndAmount(String brand, String series, Integer amount);
}
