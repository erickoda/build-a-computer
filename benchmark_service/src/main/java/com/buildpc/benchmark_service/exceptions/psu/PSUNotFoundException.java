package com.buildpc.benchmark_service.exceptions.psu;

public class PSUNotFoundException extends RuntimeException {
    public PSUNotFoundException(String message) {
        super(message);
    }
}
