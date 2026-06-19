package com.buildpc.benchmark_service.repository.specs;

import com.buildpc.benchmark_service.entities.Benchmark;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Slf4j
public class BenchmarkSpecs {
    public static Specification<Benchmark> fromRequest(
            List<String> cpus,
            List<String> gpus,
            List<String> ramMemories,
            List<String> games,
            List<String> users
    ) {
        return Specification.where(cpuIn(cpus))
                .and(gpuIn(gpus))
                .and(ramIn(ramMemories))
                .and(gameIn(games))
                .and(userIn(users));
    }

    public static Specification<Benchmark> cpuIn(List<String> cpus){
        var uuids = toUUIDs(cpus);
        if(uuids.isEmpty()) return (root, query, cb) ->
                cb.conjunction();

        return (root, query, cb) ->
                root.get("cpu").get("id").in(uuids);
    }

    public static Specification<Benchmark> gpuIn(List<String> gpus){
        var uuids = toUUIDs(gpus);
        if(uuids.isEmpty()) return (root, query, cb) ->
                cb.conjunction();

        return (root, query, cb) ->
                root.get("gpu").get("id").in(uuids);
    }

    public static Specification<Benchmark> ramIn(List<String> ram_memories){
        var uuids = toUUIDs(ram_memories);
        if(uuids.isEmpty()) return (root, query, cb) ->
                cb.conjunction();

        return (root, query, cb) ->
                root.get("ram").get("id").in(uuids);
    }

    public static Specification<Benchmark> gameIn(List<String> games){
        var uuids = toUUIDs(games);
        if(uuids.isEmpty()) return (root, query, cb) ->
                cb.conjunction();

        return (root, query, cb) ->
                root.get("game").get("id").in(uuids);
    }

    public static Specification<Benchmark> userIn(List<String> users) {
        var uuids = toUUIDs(users);
        if(uuids.isEmpty()) return (root, query, cb) ->
                cb.conjunction();

        return (root, query, cb) ->
                root.get("userId").get("id").in(uuids);
    }

    public static Specification<Benchmark> titleLike(String title){
        if(title == null || title.trim().isEmpty())
            return (root, query, cb) ->
                cb.conjunction();

        return (root, query, cb) ->
            cb.like(root.get("title"), "%" + title + "%");
    }

    private static List<UUID> toUUIDs(List<String> ids) {
        if(ids == null || ids.isEmpty()) return List.of();

        return ids.stream()
                .filter(s -> s != null && !s.isBlank())
                .map( s -> {
                    try{
                        return UUID.fromString(s);
                    } catch(IllegalArgumentException e) {
                        log.warn("Invalid UUID: {}", s);
                        return null;
                    }
                })
                .filter(Objects::nonNull).toList();
    }
}
