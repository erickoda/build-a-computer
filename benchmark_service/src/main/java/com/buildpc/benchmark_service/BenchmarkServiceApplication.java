package com.buildpc.benchmark_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class BenchmarkServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(BenchmarkServiceApplication.class, args);
	}

}