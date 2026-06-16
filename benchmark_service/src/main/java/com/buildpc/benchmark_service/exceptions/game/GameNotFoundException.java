package com.buildpc.benchmark_service.exceptions.game;

public class GameNotFoundException extends RuntimeException {
    public GameNotFoundException(String message) {
        super(message);
    }
}
