# Recommendation Microservice (Go)

gRPC service that recommends a gaming PC from the games the user wants to play, their
budget, the target resolution and the expected performance level.

It follows **Hexagonal Architecture (Ports and Adapters)** with **Domain-Driven
Design**, and wires its dependencies with **uber/fx**. It reads the hardware, games and
benchmarks catalog from `recommendation_db`, a database it shares with the
[benchmark microservice](../benchmark_microservice/README.md). The Java service owns
the schema (Flyway), and this service only reads it.

Built with **grpc-go**, **gorm** (PostgreSQL) and **uber/fx**.

## gRPC service

Contract: [`pkg/protos/builder.proto`](pkg/protos/builder.proto) (package
`recommendation.v1`). Default port: `50052`.

```proto
service BuilderService {
  rpc BuildPC(BuildPCRequest) returns (BuildPCResponse);
}

message BuildPCRequest {
  repeated string games = 1;            // game IDs
  float max_price = 2;                  // budget
  int32 resolution = 3;                 // 1080, 1440 or 2160
  string computer_performance = 4;      // low | medium | high | ultra
}
```

The response is a list of `PC`s (CPU, GPU, RAM, motherboard, PSU and SSD). It is empty
when no build fits the request. The call needs no authentication.

## How a build is chosen

`internal/adapters/grpc/builder_handler.go` runs these steps, using the functions in
`internal/services/builder_service.go`:

1. **Benchmarks**: finds the benchmarks, at the requested resolution, of the
   *heaviest* selected game (the one with the lowest average FPS).
2. **Base build (CPU + GPU + RAM)**: scores each benchmark as
   `avg_fps × performance weight ÷ component prices` (weights: low 1, medium 2,
   high 3, ultra 4). It sorts the scores and keeps the best benchmark in the quartile
   that matches the requested performance level.
3. **Motherboard**: keeps the boards that match the CPU socket and the RAM DDR
   generation, scores them by specs ÷ price, and picks one in the requested quartile.
4. **Power supply**: keeps the PSUs that cover the highest recommended wattage of the
   CPU and GPU (also +50 W and +100 W). It scores them by efficiency ranking and 80 Plus
   certification ÷ price, and picks the best.
5. **SSD**: keeps the drives with enough space for all selected games, scores them by
   type (SATA / M.2 SATA / M.2 NVMe), read/write speed and capacity ÷ price, and picks
   one in the requested quartile.
6. **Budget**: builds the PCs and removes the ones whose total price is above
   `max_price`.

If a step finds no candidates, the service returns an empty response.

## Configuration

| Variable | Description |
|---|---|
| `ADDR` | Listen address, e.g. `0.0.0.0:50052` |
| `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGSSLMODE` | PostgreSQL connection |

In `docker-compose.yml` these come from the root `.env`
(`RECOMMENDATION_MICROSERVICE_ADDR` and `RECOMMENDATION_PG*`). When running locally,
export them or put them in this folder's `.env`.

## Running

With the whole stack (from the repository root):

```bash
docker compose up -d --build recommendation_microservice
```

Locally, with [Task](https://taskfile.dev) (the database must be up and the schema
created by the benchmark microservice's migrations):

```bash
task run        # go run cmd/server/main.go
task build      # go build -o bin/server cmd/server/main.go
```

> `docker-compose-go.yaml` is an old standalone setup (Postgres + pgAdmin on port
> 50051 with `.env.dev`). Use the root `docker-compose.yml` / `docker-compose.dev.yml`
> instead.

## Protobuf stubs

This service does **not** read the shared `proto/` folder. It builds from its own copy
of the contracts in `pkg/protos/` (`builder.proto`, `hardwares.proto`) and from the
generated `*.pb.go` files, which are committed. They are the same as
`proto/recommendation/` except for the `go_package` option. The Dockerfile does not
run `protoc`.

After changing `proto/recommendation/`, copy the change into `pkg/protos/` and
regenerate the stubs (needs `protoc`, `protoc-gen-go` and `protoc-gen-go-grpc`):

```bash
task proto-gen
```

## Tests

The tests in `internal/adapters/db/` and `internal/services/tests/` connect to a real
PostgreSQL through the `PG*` variables, so start the database and seed it first:

```bash
go test ./...
```

## File architecture

```
recommendation_microservice/
├── cmd/
│   └── server/
│       └── main.go                         # Starts the fx application
├── internal/
│   ├── app/
│   │   └── modules.go                      # fx providers + gRPC server lifecycle (listens on ADDR)
│   ├── adapters/
│   │   ├── grpc/                           # Driving adapter
│   │   │   └── builder_handler.go          # BuildPC: runs the steps and maps errors to gRPC codes
│   │   └── db/                             # Driven adapters (gorm)
│   │       ├── db.go                       # Connection from the PG* variables
│   │       ├── errors.go
│   │       ├── benchmark_repository.go
│   │       ├── cpu_repository.go
│   │       ├── gpu_repository.go
│   │       ├── ram_memory_repository.go
│   │       ├── mother_board_repository.go
│   │       ├── power_source_repository.go
│   │       ├── ssd_repository.go
│   │       ├── games_repository.go
│   │       └── repsitories_test.go
│   ├── domain/
│   │   ├── enums/
│   │   │   ├── computer_performance.go     # low / medium / high / ultra
│   │   │   ├── power_source_ranking.go     # white … titanium
│   │   │   └── ssd_type.go                 # SATA / M2 SATA / M2 NVMe
│   │   ├── errors/
│   │   │   └── errors.go                   # Domain errors
│   │   ├── models/                         # Entities mapped to the shared schema
│   │   │   ├── benchmark.go
│   │   │   ├── cpu.go
│   │   │   ├── gpu.go
│   │   │   ├── ram_memory.go
│   │   │   ├── mother_board.go
│   │   │   ├── power_source.go
│   │   │   ├── ssd.go
│   │   │   ├── games.go
│   │   │   └── pc.go                       # A complete build
│   │   └── ports/                          # Interfaces for the repositories and the builder
│   │       ├── builder.go
│   │       ├── benchmark.go
│   │       ├── cpu.go
│   │       ├── gpu.go
│   │       ├── ram_memory.go
│   │       ├── mother_board.go
│   │       ├── power_source.go
│   │       ├── ssd.go
│   │       └── games.go
│   └── services/
│       ├── builder_service.go              # Selection and scoring logic
│       └── tests/
├── pkg/
│   └── protos/                             # Contracts + committed generated stubs
│       ├── builder.proto
│       ├── hardwares.proto
│       ├── builder.pb.go
│       ├── builder_grpc.pb.go
│       └── hardwares.pb.go
├── Dockerfile
└── Taskfile.yaml                           # proto-gen, run, build
```
