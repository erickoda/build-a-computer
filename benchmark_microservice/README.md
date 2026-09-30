# Benchmark Microservice (Java / Spring Boot)

gRPC service that owns the catalog used by the recommender: **games**, **hardware**
(CPU, GPU, RAM, motherboard, PSU, SSD) and **benchmarks** (FPS measured by users for a
game on a CPU + GPU + RAM combination at a given resolution and graphics quality).

It also owns the schema of `recommendation_db`. The
[recommendation microservice](../recommendation_microservice/README.md) reads the same
database to build PCs.

Built with **Java 21**, **Spring Boot 4**, **Spring gRPC**, **Spring Data JPA**,
**Flyway** and **Lombok**.

## gRPC services

Contracts: [`proto/benchmark/`](../proto/benchmark) (package `pkg.protos.v1`),
compiled by the Gradle protobuf plugin. Port: set with `SPRING_GRPC_SERVER_PORT`
(`50053` in Compose; Spring gRPC uses `9090` if it is not set).

| Service | RPCs |
|---|---|
| `BenchmarkService` | `CreateBenchmark`, `GetBenchmark`, `ListBenchmarks`, `DeleteBenchmark`, `GetWithFilters` (by CPU/GPU/RAM/game/user IDs), `GetOfAnUser`, `ListByTitle` |
| `GameService` | `CreateGame`, `GetGame`, `ListGames`, `UpdateGame`, `DeleteGame` |
| `CPUService`, `GPUService`, `RAMService`, `MotherBoardService`, `PSUService`, `SSDService` | `Create…`, `Get…`, `List…`, `Update…`, `Delete…` |

Errors are returned as gRPC status codes: `NOT_FOUND` (unknown ID), `ALREADY_EXISTS`
(duplicated item), `INVALID_ARGUMENT` (malformed UUID or enum) and `INTERNAL`.

### Authorization

`grpc/AuthServerInterceptor.java` is a global interceptor that checks the
`x-user-id` / `x-user-role` metadata set by the API Gateway:

| Calls | Requirement |
|---|---|
| All reads (`Get…`, `List…`, filters) | None (public) |
| `CreateBenchmark`, `DeleteBenchmark` | Any valid role (`common`, `supervisor`, `admin`) |
| `Create…` / `Delete…` on games and hardware | `supervisor` or `admin` |
| `Update…` on games and hardware | Not checked by the interceptor |

Missing or malformed metadata returns `UNAUTHENTICATED`. A `common` user calling a
supervisor/admin method gets `PERMISSION_DENIED`. `DeleteBenchmark` does not check that
the caller is the benchmark's author.

## Database

Schema: [`src/main/resources/db/migration/V1__init_schema.sql`](src/main/resources/db/migration/V1__init_schema.sql)

- Tables: `cpus`, `gpus`, `ram_memories`, `mother_boards`, `power_sources`, `ssds`,
  `games`, `benchmarks`.
- Postgres enums: `performance` (`low`, `medium`, `high`, `ultra`), `psu_ranking`
  (`white` … `titanium`) and `ssd_type` (`SATA`, `M2 SATA`, `M2 NVMe`). They are mapped
  by the Hibernate `UserType`s in `entities/valueObjects/`.
- `benchmarks` references `cpus`, `gpus`, `ram_memories` and `games`, and stores the
  author's `user_id`.

Flyway runs the migrations at startup, and Hibernate only validates the schema
(`ddl-auto=validate`). To change the schema, add a new `V<n>__description.sql`
migration and do not edit the existing ones. Update the models in the recommendation
microservice too.

## Configuration

`application.properties` has defaults for local development
(`jdbc:postgresql://localhost:5432/benchmark`, user `postgres`, password `123`). In
Compose they are overridden by environment variables:

| Variable | Description |
|---|---|
| `SPRING_GRPC_SERVER_PORT` | gRPC port (`BENCHMARK_MICROSERVICE_PORT` in the root `.env`) |
| `SPRING_DATASOURCE_URL` | JDBC URL of `recommendation_db` |
| `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` | Database credentials (`RECOMMENDATION_PGUSER` / `RECOMMENDATION_PGPASSWORD`) |

## Running

With the whole stack (from the repository root):

```bash
docker compose up -d --build benchmark_microservice
```

Locally, start a PostgreSQL that matches `application.properties` and run the app:

```bash
docker compose up -d postgres   # this folder's docker-compose.yaml: Postgres + pgAdmin, reads ./.env
./gradlew bootRun
```

The standalone `docker-compose.yaml` reads `POSTGRES_USER`, `POSTGRES_PASSWORD`,
`POSTGRES_DB` and the `PGADMIN_*` variables from this folder's `.env`. The build reads
the protos from `../proto/benchmark`, so run it from inside the repository. The Docker
image receives them through the `protos` additional build context.

To seed games, hardware and benchmarks, use `scripts/seed-databases.sh` at the
repository root. It calls the API Gateway.

## Build and tests

```bash
./gradlew build          # Compile, generate the gRPC stubs, run the tests
./gradlew bootJar        # Build only the executable jar (build/libs/)
./gradlew test
```

The only test is a Spring context-load test, and it needs a reachable database.

## File architecture

```
benchmark_microservice/
├── build.gradle                          # Spring Boot, Spring gRPC, JPA, Flyway, protobuf plugin (reads ../proto/benchmark)
├── Dockerfile                            # Gradle bootJar → JRE 21 alpine
├── docker-compose.yaml                   # Standalone Postgres + pgAdmin for local development
└── src/main/
    ├── resources/
    │   ├── application.properties
    │   └── db/migration/
    │       └── V1__init_schema.sql       # Flyway: enums and tables
    └── java/com/buildpc/benchmark_microservice/
        ├── BenchmarkServiceApplication.java
        ├── grpc/                         # gRPC endpoints (@GrpcService)
        │   ├── AuthServerInterceptor.java    # Metadata and role checks for write calls
        │   ├── BenchmarkGrpcService.java
        │   ├── GameGrpcService.java
        │   └── {CPU,GPU,RAM,MotherBoard,PSU,Storage}GrpcService.java
        ├── services/                     # Business logic (@Service, transactional)
        │   ├── BenchmarkService.java
        │   ├── GameService.java
        │   └── {CPU,GPU,RAM,MotherBoard,PSU,Storage}Service.java
        ├── repository/                   # Spring Data JPA repositories
        │   ├── BenchmarkRepository.java
        │   ├── GameRepository.java
        │   ├── {CPU,GPU,RAM,MotherBoard,PSU,Storage}Repository.java
        │   └── specs/                    # JPA Specifications for dynamic filters
        │       ├── BenchmarkSpecs.java
        │       └── CPUSpecs.java
        ├── mapper/                       # Protobuf ⇄ entity conversions
        │   └── {Benchmark,Game,CPU,GPU,RAM,MotherBoard,PSU,Storage}Mapper.java
        ├── entities/                     # JPA entities
        │   ├── Benchmark.java
        │   ├── Game.java
        │   ├── CPU.java, GPU.java, RAM.java, MotherBoard.java, PSU.java
        │   ├── Storage.java              # SSD
        │   └── valueObjects/             # Enums + Hibernate UserTypes for the Postgres enums
        │       ├── Performance.java, PerformanceUserType.java
        │       ├── PSURanking.java, PSURankingUserType.java
        │       └── SSDType.java, SSDTypeUserType.java
        └── exceptions/                   # NotFound / Duplicated exceptions for each resource
```
