package com.buildpc.benchmark_microservice.repository;

import com.buildpc.benchmark_microservice.entities.CPU;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface CPURepository extends JpaRepository<CPU, UUID>,
                                        JpaSpecificationExecutor<CPU> {
    boolean existsBySeries(String series);
}
