package com.buildpc.benchmark_microservice.exceptions.game;

public class DuplicatedGameException extends RuntimeException {
    public DuplicatedGameException(String message) {
        super(message);
    }
}
