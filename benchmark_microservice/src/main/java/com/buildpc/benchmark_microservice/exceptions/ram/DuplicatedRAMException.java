package com.buildpc.benchmark_microservice.exceptions.ram;

public class DuplicatedRAMException extends RuntimeException {
    public DuplicatedRAMException(String message) {
        super(message);
    }
}
