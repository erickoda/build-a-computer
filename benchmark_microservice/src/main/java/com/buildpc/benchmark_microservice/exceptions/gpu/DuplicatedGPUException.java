package com.buildpc.benchmark_microservice.exceptions.gpu;

public class DuplicatedGPUException extends RuntimeException {
    public DuplicatedGPUException(String message) {
        super(message);
    }
}
