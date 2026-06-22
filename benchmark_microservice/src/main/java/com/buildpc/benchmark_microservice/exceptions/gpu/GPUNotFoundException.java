package com.buildpc.benchmark_microservice.exceptions.gpu;

public class GPUNotFoundException extends RuntimeException {
    public GPUNotFoundException(String message) {
        super(message);
    }
}
