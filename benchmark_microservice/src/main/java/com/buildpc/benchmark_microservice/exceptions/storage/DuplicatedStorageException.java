package com.buildpc.benchmark_microservice.exceptions.storage;

public class DuplicatedStorageException extends RuntimeException {
    public DuplicatedStorageException(String message) {
        super(message);
    }
}
