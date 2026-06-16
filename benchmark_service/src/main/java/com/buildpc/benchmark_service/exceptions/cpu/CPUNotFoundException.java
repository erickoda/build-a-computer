package com.buildpc.benchmark_service.exceptions.cpu;

public class CPUNotFoundException extends RuntimeException {
    public CPUNotFoundException(String message) {
        super(message);
    }
}
