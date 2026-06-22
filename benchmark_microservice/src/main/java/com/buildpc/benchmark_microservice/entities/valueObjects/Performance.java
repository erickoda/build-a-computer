package com.buildpc.benchmark_microservice.entities.valueObjects;

public enum Performance {
    LOW,
    MEDIUM,
    HIGH,
    ULTRA;

    public String toDatabaseValue() {
        return switch (this) {
            case LOW -> "low";
            case MEDIUM -> "medium";
            case HIGH -> "high";
            case ULTRA -> "ultra";
        };
    }

    public static Performance fromDatabaseValue(String dbValue) {
        return switch (dbValue.trim()) {
            case "low" -> LOW;
            case "medium" -> MEDIUM;
            case "high" -> HIGH;
            case "ultra" -> ULTRA;
            default -> throw new IllegalArgumentException("Valor inválido: " + dbValue);
        };
    }

    public String toProtoValue() {
        return toDatabaseValue();
    }
}
