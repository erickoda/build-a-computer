package com.buildpc.benchmark_microservice.repository;

import com.buildpc.benchmark_microservice.entities.Game;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GameRepository extends JpaRepository<Game, UUID> {
    boolean existsByNameAndNecessaryDisk(String name, Integer necessaryDisk);
}
