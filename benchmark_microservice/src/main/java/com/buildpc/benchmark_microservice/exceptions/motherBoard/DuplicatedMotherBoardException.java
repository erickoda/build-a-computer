package com.buildpc.benchmark_microservice.exceptions.motherBoard;

public class DuplicatedMotherBoardException extends RuntimeException {
    public DuplicatedMotherBoardException(String message) {
        super(message);
    }
}
