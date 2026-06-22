package com.buildpc.benchmark_microservice.exceptions.benchmark;

public class BenchmarkNotFoundException extends RuntimeException {
    public BenchmarkNotFoundException(String message) {
        super(message);
    }
}
