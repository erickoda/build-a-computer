package com.buildpc.benchmark_microservice.exceptions.storage;

public class StorageNotFoundException extends RuntimeException {
    public StorageNotFoundException(String message) {
        super(message);
    }
}
