package com.buildpc.benchmark_microservice.entities.valueObjects;

public enum PSURanking {
    WHITE,
    BRONZE,
    SILVER,
    GOLD,
    PLATINUM,
    TITANIUM;

    public String toDatabaseValue() {
        return switch (this) {
            case WHITE-> "white";
            case BRONZE -> "bronze";
            case SILVER -> "silver";
            case GOLD -> "gold";
            case PLATINUM -> "platinum";
            case TITANIUM -> "titanium";
        };
    }

    public static PSURanking fromDatabaseValue(String dbValue) {
        return switch (dbValue.trim()) {
            case "white" -> WHITE;
            case "bronze" -> BRONZE;
            case "silver" -> SILVER;
            case "gold" -> GOLD;
            case "platinum" -> PLATINUM;
            case "titanium" -> TITANIUM;
            default -> throw new IllegalArgumentException("Valor inválido: " + dbValue);
        };
    }

    public String toProtoValue() {
        return toDatabaseValue();
    }
}
