package com.buildpc.benchmark_service.exceptions;

public class DuplicatedCPUException extends RuntimeException {
    public DuplicatedCPUException(String message) {
        super(message);
    }
}
