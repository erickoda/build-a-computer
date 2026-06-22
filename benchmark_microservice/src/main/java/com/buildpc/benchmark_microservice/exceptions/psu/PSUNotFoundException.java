package com.buildpc.benchmark_microservice.exceptions.psu;

public class PSUNotFoundException extends RuntimeException {
    public PSUNotFoundException(String message) {
        super(message);
    }
}
