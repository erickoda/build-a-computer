package com.buildpc.benchmark_service.exceptions.storage;

public class DuplicatedStorageException extends RuntimeException {
    public DuplicatedStorageException(String message) {
        super(message);
    }
}
