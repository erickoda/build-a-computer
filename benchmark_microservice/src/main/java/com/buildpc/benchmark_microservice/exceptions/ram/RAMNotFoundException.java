package com.buildpc.benchmark_microservice.exceptions.ram;

public class RAMNotFoundException extends RuntimeException {
    public RAMNotFoundException(String message) {
        super(message);
    }
}
