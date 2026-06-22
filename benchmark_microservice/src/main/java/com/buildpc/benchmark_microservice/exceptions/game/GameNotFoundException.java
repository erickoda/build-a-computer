package com.buildpc.benchmark_microservice.exceptions.game;

public class GameNotFoundException extends RuntimeException {
    public GameNotFoundException(String message) {
        super(message);
    }
}
