package com.buildpc.benchmark_microservice.grpc;

import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.ServerInterceptor;
import io.grpc.Status;
import lombok.extern.slf4j.Slf4j;
import org.springframework.grpc.server.GlobalServerInterceptor;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Intercepta as chamadas gRPC que alteram dados (create/delete), exigindo que o
 * gateway tenha repassado os metadados {@code x-user-id} e {@code x-user-role}
 * (espelhando o {@code auth_interceptor} do authentication_microservice), e
 * aplica a regra de negócio de autorização:
 * <ul>
 *   <li>Benchmarks: acessível para os cargos {@code common}, {@code supervisor} e {@code admin}.</li>
 *   <li>Hardware (CPU/GPU/RAM/MotherBoard/PSU/SSD) e Jogos: exclusivo para {@code supervisor} e {@code admin}.</li>
 * </ul>
 * Chamadas de leitura (get/list/filtros) permanecem públicas, sem exigir autenticação.
 */
@Slf4j
@Component
@GlobalServerInterceptor
public class AuthServerInterceptor implements ServerInterceptor {

    private static final Metadata.Key<String> USER_ID_KEY =
            Metadata.Key.of("x-user-id", Metadata.ASCII_STRING_MARSHALLER);
    private static final Metadata.Key<String> USER_ROLE_KEY =
            Metadata.Key.of("x-user-role", Metadata.ASCII_STRING_MARSHALLER);

    private static final Set<String> VALID_ROLES = Set.of("common", "supervisor", "admin");

    private static final Set<String> BENCHMARK_METHODS = Set.of(
            "pkg.protos.v1.BenchmarkService/CreateBenchmark",
            "pkg.protos.v1.BenchmarkService/DeleteBenchmark"
    );

    private static final Set<String> ADMIN_OR_SUPERVISOR_METHODS = Set.of(
            "pkg.protos.v1.GameService/CreateGame",
            "pkg.protos.v1.GameService/DeleteGame",
            "pkg.protos.v1.CPUService/CreateCPU",
            "pkg.protos.v1.CPUService/DeleteCPU",
            "pkg.protos.v1.GPUService/CreateGPU",
            "pkg.protos.v1.GPUService/DeleteGPU",
            "pkg.protos.v1.RAMService/CreateRAM",
            "pkg.protos.v1.RAMService/DeleteRAM",
            "pkg.protos.v1.MotherBoardService/CreateMotherBoard",
            "pkg.protos.v1.MotherBoardService/DeleteMotherBoard",
            "pkg.protos.v1.PSUService/CreatePSU",
            "pkg.protos.v1.PSUService/DeletePSU",
            "pkg.protos.v1.SSDService/CreateSSD",
            "pkg.protos.v1.SSDService/DeleteSSD"
    );

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
            ServerCall<ReqT, RespT> call,
            Metadata headers,
            ServerCallHandler<ReqT, RespT> next) {

        String method = call.getMethodDescriptor().getFullMethodName();
        boolean isBenchmarkMethod = BENCHMARK_METHODS.contains(method);
        boolean isAdminOrSupervisorMethod = ADMIN_OR_SUPERVISOR_METHODS.contains(method);

        if (!isBenchmarkMethod && !isAdminOrSupervisorMethod) {
            return next.startCall(call, headers);
        }

        String userId = headers.get(USER_ID_KEY);
        String userRole = headers.get(USER_ROLE_KEY);

        if (userId == null || userId.isBlank()) {
            return unauthenticated(call, "Access Denied: did not receive x-user-id");
        }

        if (userRole == null || userRole.isBlank()) {
            return unauthenticated(call, "Access Denied: did not receive x-user-role");
        }

        try {
            UUID.fromString(userId);
        } catch (IllegalArgumentException e) {
            return unauthenticated(call, "Access Denied: invalid x-user-id");
        }

        String normalizedRole = userRole.toLowerCase(Locale.ROOT);

        if (!VALID_ROLES.contains(normalizedRole)) {
            return unauthenticated(call, "Access Denied: invalid x-user-role");
        }

        if (isAdminOrSupervisorMethod && normalizedRole.equals("common")) {
            return permissionDenied(call, "Access Denied: this operation requires the supervisor or admin role");
        }

        return next.startCall(call, headers);
    }

    private <ReqT, RespT> ServerCall.Listener<ReqT> unauthenticated(ServerCall<ReqT, RespT> call, String message) {
        return reject(call, Status.UNAUTHENTICATED, message);
    }

    private <ReqT, RespT> ServerCall.Listener<ReqT> permissionDenied(ServerCall<ReqT, RespT> call, String message) {
        return reject(call, Status.PERMISSION_DENIED, message);
    }

    private <ReqT, RespT> ServerCall.Listener<ReqT> reject(ServerCall<ReqT, RespT> call, Status status, String message) {
        log.warn("gRPC call to {} rejected: {}", call.getMethodDescriptor().getFullMethodName(), message);
        call.close(status.withDescription(message), new Metadata());
        return new ServerCall.Listener<>() {
        };
    }
}
