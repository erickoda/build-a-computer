package com.buildpc.benchmark_microservice.exceptions.cpu;

public class CPUNotFoundException extends RuntimeException {
    public CPUNotFoundException(String message) {
        super(message);
    }
}
