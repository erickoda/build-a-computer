package com.buildpc.benchmark_service.repository;

import com.buildpc.benchmark_service.entities.MotherBoard;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface MotherBoardRepository extends JpaRepository<MotherBoard, UUID> {
    boolean existsByBrandAndSeriesAndSocketAndDdr(String brand, String series, String socket, String ddr);
}
