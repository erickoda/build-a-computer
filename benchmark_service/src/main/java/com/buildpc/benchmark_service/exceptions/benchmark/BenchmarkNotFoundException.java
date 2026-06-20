package com.buildpc.benchmark_service.exceptions.benchmark;

public class BenchmarkNotFoundException extends RuntimeException {
    public BenchmarkNotFoundException(String message) {
        super(message);
    }
}
