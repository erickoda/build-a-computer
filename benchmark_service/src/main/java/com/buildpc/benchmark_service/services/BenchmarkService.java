package com.buildpc.benchmark_service.services;

import com.buildpc.benchmark_service.entities.Benchmark;
import com.buildpc.benchmark_service.repositories.BenchmarkRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@AllArgsConstructor
public class BenchmarkService {
	private final BenchmarkRepository benchmarkRepository;

	public void saveBenchmark(Benchmark benchmark) {
		benchmarkRepository.save(benchmark);
	}

	public void deleteById(UUID id) {
		benchmarkRepository.deleteById(id);
	}

	public Optional<Benchmark> findById(UUID id) {
		return benchmarkRepository.findById(id);
	}
}
