package com.buildpc.benchmark_service.exceptions.gpu;

public class GPUNotFoundException extends RuntimeException {
    public GPUNotFoundException(String message) {
        super(message);
    }
}
