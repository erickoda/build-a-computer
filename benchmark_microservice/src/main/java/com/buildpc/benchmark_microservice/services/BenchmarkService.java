package com.buildpc.benchmark_microservice.services;

import com.buildpc.benchmark_microservice.entities.Benchmark;
import com.buildpc.benchmark_microservice.exceptions.benchmark.BenchmarkNotFoundException;
import com.buildpc.benchmark_microservice.repository.BenchmarkRepository;
import com.buildpc.benchmark_microservice.repository.specs.BenchmarkSpecs;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
@AllArgsConstructor
public class BenchmarkService {
	private final BenchmarkRepository benchmarkRepository;

	public Benchmark saveBenchmark(Benchmark benchmark) {
		return benchmarkRepository.save(benchmark);
	}

	public void deleteById(UUID id)
	{
		if(!benchmarkRepository.existsById(id))
			throw new BenchmarkNotFoundException("Can't find this benchmark");

		benchmarkRepository.deleteById(id);
	}

	public Optional<Benchmark> findById(UUID id) {
		return benchmarkRepository.findById(id);
	}

	public List<Benchmark> searchAll() {
		List<Benchmark> benchmarks = benchmarkRepository.findAll();

		if(benchmarks.isEmpty())
			throw new BenchmarkNotFoundException("None benchmark was found");

		return benchmarks;
	}

	public List<Benchmark> searchByFilters(
			List<String> cpus,
			List<String> gpus,
			List<String> ramMemories,
			List<String> games,
			List<String> users
	) {
		Specification<Benchmark> specs = BenchmarkSpecs.fromRequest(
				cpus,
				gpus,
				ramMemories,
				games,
				users
		);

		List<Benchmark> benchmarks = benchmarkRepository.findAll(specs);

		if(benchmarks.isEmpty())
			throw new BenchmarkNotFoundException("None benchmark was found");

		return benchmarks;
	}

	public List<Benchmark> searchByTitle(String title) {
		Specification<Benchmark> spec = BenchmarkSpecs.titleLike(title);

		List<Benchmark> benchmarks = benchmarkRepository.findAll(spec);

		if(benchmarks.isEmpty())
			return null;

		return benchmarks;
	}

	public List<Benchmark> searchAllOfUser(String strUserID){
		try {
			UUID userID = UUID.fromString(strUserID);

			List<Benchmark> benchmarks = benchmarkRepository.findAllByUserId(userID);

			if(benchmarks.isEmpty())
				return null;

			return benchmarks;
		}
		catch(IllegalArgumentException e) {
			throw new IllegalArgumentException("Invalid UUID format");
		}
	}

	public Benchmark searchByID(String strID) {
		try {
			UUID id = UUID.fromString(strID);

			Optional<Benchmark> benchmark = benchmarkRepository.findById(id);

			return benchmark.orElseThrow(() ->
					new BenchmarkNotFoundException("Can't find this benchamrk in data base")
			);
		}
		catch(IllegalArgumentException e) {
			throw new IllegalArgumentException("Invalid UUID format");
		}
	}
}
