package com.buildpc.benchmark_service.exceptions;

public class CPUNotFoundException extends RuntimeException {
    public CPUNotFoundException(String message) {
        super(message);
    }
}
