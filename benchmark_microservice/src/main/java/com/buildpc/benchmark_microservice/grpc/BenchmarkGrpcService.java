package com.buildpc.benchmark_microservice.grpc;

import com.buildpc.benchmark_microservice.entities.Benchmark;
import com.buildpc.benchmark_microservice.exceptions.benchmark.BenchmarkNotFoundException;
import com.buildpc.benchmark_microservice.grpc.generated.*;
import com.buildpc.benchmark_microservice.mapper.BenchmarkMapper;
import com.buildpc.benchmark_microservice.services.BenchmarkService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.grpc.server.service.GrpcService;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@GrpcService
@RequiredArgsConstructor
@Transactional
public class BenchmarkGrpcService extends BenchmarkServiceGrpc.BenchmarkServiceImplBase {
    private final BenchmarkService benchmarkService;
    private final BenchmarkMapper benchmarkMapper;

    @Override
    public void createBenchmark(CreateBenchmarkRequest request, StreamObserver<BenchmarkResponse> responseObserver) {
        log.info("gRPC Create Benchmark called");

        try{
            Benchmark savedBenchmark = benchmarkService.saveBenchmark(benchmarkMapper.toEntity(request));

            responseObserver.onNext(benchmarkMapper.toProto(savedBenchmark));
            responseObserver.onCompleted();
        }
        catch(IllegalArgumentException e){
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch (Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }

    @Override
    public void getWithFilters(GetBenchmarkWithFilters request, StreamObserver<ListBenchmarkResponse> responseObserver) {
        log.info("gRPC Get Benchmarks with filters called");

        try{
            List<Benchmark> foundBenchmarks = benchmarkService.searchByFilters(
                    request.getCpuIdList(),
                    request.getGpuIdList(),
                    request.getRamIdList(),
                    request.getGameIdList(),
                    request.getUserIdList()
            );

            List<BenchmarkResponse> benchmarksMappedToProto = foundBenchmarks.stream()
                    .map(benchmarkMapper::toProto)
                    .toList();

            responseObserver.onNext(benchmarkMapper.createListBenchmarkResponse(benchmarksMappedToProto));
            responseObserver.onCompleted();
        }
        catch(BenchmarkNotFoundException e){
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch(IllegalArgumentException e){
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch (Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }

    @Override
    public void deleteBenchmark(DeleteBenchmarkRequest request, StreamObserver<DeleteBenchmarkResponse> responseObserver) {
        log.info("gRPC Delete Benchmark called");

        try{
            benchmarkService.deleteById(UUID.fromString(request.getId()));

            responseObserver.onNext(benchmarkMapper.createDeleteBenchmarkResponse(true));
            responseObserver.onCompleted();
        }
        catch(BenchmarkNotFoundException e){
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch(IllegalArgumentException e){
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch(Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }

    @Override
    public void listByTitle(ListBenchmarksByTitleRequest request, StreamObserver<ListBenchmarkResponse> responseObserver) {
        log.info("gRPC List Benchmarks by name called");

        try{
            List<Benchmark> foundBenchmarks = benchmarkService.searchByTitle(
                    request.getTitle()
            );

            if(foundBenchmarks == null) {
                responseObserver.onCompleted();
                return;
            }

            List<BenchmarkResponse> benchmarksMappedToProto = foundBenchmarks.stream()
                    .map(benchmarkMapper::toProto)
                    .toList();

            responseObserver.onNext(
                    benchmarkMapper.createListBenchmarkResponse(benchmarksMappedToProto)
            );

            responseObserver.onCompleted();
        }
        catch(IllegalArgumentException e){
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch (Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }

    @Override
    public void listBenchmarks(ListBenchmarkRequest request, StreamObserver<ListBenchmarkResponse> responseObserver) {
        log.info("gRPC Get all Benchmarks called");

        try{
            List<Benchmark> foundBenchmarks = benchmarkService.searchAll();

            List<BenchmarkResponse> benchmarksMappedToProto = foundBenchmarks.stream()
                    .map(benchmarkMapper::toProto)
                    .toList();

            responseObserver.onNext(benchmarkMapper.createListBenchmarkResponse(benchmarksMappedToProto));
            responseObserver.onCompleted();
        }
        catch(BenchmarkNotFoundException e){
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch (Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }

    @Override
    public void getOfAnUser(GetBenchmarksOfAnUser request, StreamObserver<ListBenchmarkResponse> responseObserver) {
        log.info("gRPC Get all Benchmarks of and User called");

        try {
            List<Benchmark> foundBenchmarks = benchmarkService.searchAllOfUser(request.getUserId());

            if(foundBenchmarks == null) {
                responseObserver.onCompleted();
                return;
            }

            List<BenchmarkResponse> benchmarksMappedToProto = foundBenchmarks.stream()
                    .map(benchmarkMapper::toProto)
                    .toList();

            responseObserver.onNext(
                    benchmarkMapper.createListBenchmarkResponse(benchmarksMappedToProto)
            );

            responseObserver.onCompleted();
        }
        catch(IllegalArgumentException e){
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch (Exception e) {
        responseObserver.onError(Status.INTERNAL
                .withDescription(e.getMessage())
                .asException());
        }
    }

    @Override
    public void getBenchmark(GetBenchmarkRequest request, StreamObserver<BenchmarkResponse> responseObserver) {
        log.info("gRPC Get a benchmark by its ID called");

        try {
            Benchmark foundBench = benchmarkService.searchByID(
                    request.getId()
            );

            responseObserver.onNext(benchmarkMapper.toProto(foundBench));
            responseObserver.onCompleted();
        }
        catch(BenchmarkNotFoundException e){
            responseObserver.onError(Status.NOT_FOUND
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch(IllegalArgumentException e){
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription(e.getMessage())
                    .asException());
        }
        catch(Exception e) {
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage())
                    .asException());
        }
    }
}
