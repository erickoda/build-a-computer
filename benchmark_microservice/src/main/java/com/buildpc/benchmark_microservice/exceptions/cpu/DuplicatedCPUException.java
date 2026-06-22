package com.buildpc.benchmark_microservice.exceptions.cpu;

public class DuplicatedCPUException extends RuntimeException {
    public DuplicatedCPUException(String message) {
        super(message);
    }
}
