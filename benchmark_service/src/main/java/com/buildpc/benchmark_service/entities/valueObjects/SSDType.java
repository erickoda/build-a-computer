package com.buildpc.benchmark_service.entities.valueObjects;

import lombok.Getter;

@Getter
public enum SSDType {
    SATA,
    M2_SATA,
    M2_NVME;

    public String toDatabaseValue() {
        return switch (this) {
            case SATA -> "SATA";
            case M2_SATA -> "M2 SATA";
            case M2_NVME -> "M2 NVMe";
        };
    }

    public static SSDType fromDatabaseValue(String dbValue) {
        return switch (dbValue.trim()) {
            case "SATA" -> SATA;
            case "M2 SATA" -> M2_SATA;
            case "M2 NVMe" -> M2_NVME;
            default -> throw new IllegalArgumentException("Valor inválido: " + dbValue);
        };
    }

    public String toProtoValue() {
        return toDatabaseValue();
    }
}
