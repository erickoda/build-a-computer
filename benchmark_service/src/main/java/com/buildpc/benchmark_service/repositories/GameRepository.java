package com.buildpc.benchmark_service.repositories;

import com.buildpc.benchmark_service.entities.Game;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GameRepository extends JpaRepository<Game, UUID> {
}
