package com.buildpc.benchmark_service.exceptions.storage;

public class StorageNotFoundException extends RuntimeException {
    public StorageNotFoundException(String message) {
        super(message);
    }
}
