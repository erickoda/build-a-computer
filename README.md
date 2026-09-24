# Build a Computer

A distributed system that recommends a gaming PC build from the games you want to
play, your budget, your target resolution and the performance level you expect.

The project is a polyglot microservice stack: a Rust HTTP **API Gateway** in front of
three gRPC microservices written in **Rust** (authentication), **Go** (recommendation)
and **Java / Spring Boot** (benchmarks and hardware catalog), plus a **Next.js**
frontend. The gRPC contracts live in a shared `proto/` directory, compiled at build
time by the Rust and Java services (the Go service ships pre-generated stubs — see
[Shared contracts](#shared-contracts)).

> Coursework for *Sistemas Distribuídos* — USP, 2026.1.

## Architecture

```
                    ┌───────────────┐
                    │   frontend    │  Next.js 16 · React 19 · :8080
                    └───────┬───────┘
                            │ HTTP / JSON
                    ┌───────▼───────┐
                    │  api_gateway  │  Rust · axum · :3000
                    │  HTTP ⇄ gRPC  │  JWT validation, Swagger UI
                    └───┬───────┬───┘
            gRPC        │       │        gRPC
        ┌───────────────┘       └───────────────┬──────────────────┐
        │                                       │                  │
┌───────▼──────────────────┐  ┌─────────────────▼───────┐  ┌───────▼─────────────┐
│ authentication_micro...  │  │ recommendation_micro... │  │ benchmark_micro...  │
│ Rust · tonic · :50051    │  │ Go · grpc-go · :50052   │  │ Java 21 · Spring    │
│ Hexagonal + DDD          │  │ Hexagonal + DDD         │  │ gRPC · :50053       │
│ Argon2 · JWT · SMTP OTP  │  │ uber.fx · gorm          │  │ JPA · Flyway        │
└───────────┬──────────────┘  └───────────┬─────────────┘  └───────┬─────────────┘
            │                             │                        │
      ┌─────▼─────┐                 ┌─────▼────────────────────────▼─────┐
      │ users_db  │                 │        recommendation_db           │
      │ Postgres  │                 │             Postgres               │
      └───────────┘                 └────────────────────────────────────┘
```

The gateway is the only service meant to be called from outside; the three
microservices talk gRPC over the `microservice` bridge network, and each database sits
on its own bridge network shared only with the services that use it (`users_db` and
`recommendation_db`).

> Note: `docker-compose.yml` still lists `ports: - ${X_PORT}` for the microservices and
> databases. That short form publishes the container port on a **random host port**, so
> they are reachable from the Docker host too (`docker compose port <service> <port>`).
> `docker-compose.dev.yml` publishes them on fixed host ports.

The recommendation and benchmark services share `recommendation_db`: the Java service
owns the schema (Flyway migrations under
`benchmark_microservice/src/main/resources/db/migration`) and the hardware/benchmark
CRUD, while the Go service reads that catalog to assemble PC builds.

### Services

| Service | Language / Stack | Port | Responsibility |
|---|---|---|---|
| `frontend` | Next.js 16, React 19, Tailwind 4, HeroUI | 8080 | Web UI |
| `api_gateway` | Rust, axum, tonic, utoipa | 3000 | HTTP ⇄ gRPC translation, JWT auth, OpenAPI docs |
| `authentication_microservice` | Rust, tonic, sqlx, Argon2 | 50051 | Sign-up/sign-in, users CRUD, password reset via e-mail OTP |
| `recommendation_microservice` | Go, grpc-go, gorm, uber.fx | 50052 | Builds PC recommendations from games + budget |
| `benchmark_microservice` | Java 21, Spring Boot 4, Spring gRPC, JPA, Flyway | 50053 | Games, hardware catalog (CPU/GPU/RAM/MB/PSU/SSD) and benchmarks |
| `users_db` / `recommendation_db` | PostgreSQL 18.4 | 5432 / 5432 (inside the network) | Persistence |

### Shared contracts

`proto/` holds every gRPC interface and is passed to each service as an additional
build context (`additional_contexts: protos: ./proto`):

```
proto/
├── auth/auth.proto                   # Auth service
├── user/user.proto                   # Users service
├── benchmark/benchmark.proto         # BenchmarkService
├── benchmark/game.proto              # GameService
├── benchmark/hardware.proto          # CPU/GPU/RAM/MotherBoard/PSU/SSD services
├── recommendation/builder.proto      # BuilderService.BuildPC
└── recommendation/hardwares.proto    # Hardware messages shared by the builder
```

- `api_gateway` and `authentication_microservice` compile it through `build.rs`
  (tonic-prost-build).
- `benchmark_microservice` compiles `proto/benchmark` through the Gradle protobuf plugin.
- `recommendation_microservice` does **not** read `proto/`: it builds from the committed
  stubs in `recommendation_microservice/pkg/protos/*.pb.go`, generated from its own copy
  of `builder.proto` / `hardwares.proto` in that same folder (identical to
  `proto/recommendation/` except for the `go_package` option). Its Dockerfile does not
  run `protoc`. Changes to `proto/recommendation/` must be copied there and regenerated
  by hand (see [Development](#development)).

## Getting started

### Requirements

- Docker + Docker Compose plugin
- For running services outside Docker: Rust (stable), Go 1.x, JDK 21, Node 20+ with pnpm
- For `scripts/seed-databases.sh`: `docker` with the Compose plugin, `curl`, `jq`,
  `python3` with `pexpect`

### 1. Configure the environment

`.env` is git-ignored, so create one at the repository root. The variables consumed by
`docker-compose.yml` are:

```bash
# API GATEWAY
API_GATEWAY_PORT=3000
AUTH_MICROSERVICE_URL=http://authentication_microservice:50051
USERS_MICROSERVICE_URL=http://authentication_microservice:50051
RECOMMENDATION_MICROSERVICE_URL=http://recommendation_microservice:50052
BENCHMARK_MICROSERVICE_URL=http://benchmark_microservice:50053

# AUTH MICROSERVICE
AUTH_MICROSERVICE_PORT=50051
AUTH_MICROSERVICE_JWT_EXPIRATION=3600
AUTH_MICROSERVICE_SMTP_USERNAME=<gmail address used to send OTP e-mails>
AUTH_MICROSERVICE_SMTP_PASSWORD=<gmail app password>
AUTH_MICROSERVICE_USERS_DATABASE_URL=postgres://myuser:mypassword@users_db:5432/mydatabase

# USERS DB
USERS_DB_PORT=5432
USERS_DB_POSTGRES_USER=myuser
USERS_DB_POSTGRES_PASSWORD=mypassword
USERS_DB_POSTGRES_DB=mydatabase

# SHARED
JWT_SECRET=<a long random secret>

# RECOMMENDATION MICROSERVICE
RECOMMENDATION_MICROSERVICE_ADDR="0.0.0.0:50052"
RECOMMENDATION_MICROSERVICE_PORT=50052
RECOMMENDATION_PGHOST="recommendation_db"
RECOMMENDATION_PGPORT=5432
RECOMMENDATION_PGUSER=<user>
RECOMMENDATION_PGPASSWORD=<password>
RECOMMENDATION_PGDATABASE=<database>
RECOMMENDATION_PGSSLMODE="disable"

# RECOMMENDATION DB
RECOMMENDATION_DB_PORT=5433
RECOMMENDATION_DB_POSTGRES_USER=<user>
RECOMMENDATION_DB_POSTGRES_PASSWORD=<password>
RECOMMENDATION_DB_POSTGRES_DB=<database>

# BENCHMARK MICROSERVICE
BENCHMARK_MICROSERVICE_PORT=50053
```

`RECOMMENDATION_PG*` and `RECOMMENDATION_DB_POSTGRES_*` must describe the same
database — the first set is how the Go and Java services connect, the second is how
the Postgres container is created.

Some port variables only control the Compose port mappings, not what the process
listens on:

- `API_GATEWAY_PORT` / `AUTH_MICROSERVICE_PORT`: the gateway and the auth service read
  `PORT` (defaults `3000` and `50051`), which Compose does not set. Keep these
  variables at `3000` / `50051` unless you also pass `PORT`.
- `RECOMMENDATION_DB_PORT`: Postgres always listens on `5432` inside the container
  (that is what `RECOMMENDATION_PGPORT` points to). Mapping `5433` publishes a port
  nothing listens on; use `5432`, or map `5433:5432` to reach it from the host.

The frontend reads its own `frontend/.env`:

```bash
NEXT_PUBLIC_HOST=http://localhost:3000/
```

The trailing slash is required: the base URL is built as `${NEXT_PUBLIC_HOST}api/v1/`
(`frontend/src/services/api.ts`).

### 2. Run the stack

```bash
docker compose up -d --build
```

Or, for local development (`Dockerfile.dev` for the gateway, all service ports
published to the host):

```bash
docker compose -f docker-compose.dev.yml up -d --build
```

The gateway is then available at `http://localhost:3000` and the Swagger UI at
`http://localhost:3000/swagger-ui`.

### 3. Create the first admin and seed data

Creating hardware and games requires an admin or supervisor, and creating users
requires an admin (see [Permissions](#permissions)). Sign-up only creates `common`
users, so the first admin must be created through the authentication service CLI:

```bash
docker compose exec authentication_microservice cli create-admin \
  --username admin --email admin@example.com
```

`scripts/seed-databases.sh` automates that step and then populates the catalog
(hardware, games and benchmarks) through the gateway's HTTP API:

```bash
./scripts/seed-databases.sh
```

It is driven by `ADMIN_USERNAME`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` (defaults:
`admin` / `admin@example.com` / `Admin123!`).

### 4. Run the frontend

The frontend is not part of the Compose stack:

```bash
cd frontend
pnpm install
pnpm dev     # http://localhost:8080
```

## HTTP API

Everything is served under `/api/v1` by the gateway. The full, always up-to-date
specification is the OpenAPI document generated by utoipa:

- Swagger UI — `http://localhost:3000/swagger-ui`
- OpenAPI JSON — `http://localhost:3000/api-docs/openapi.json`

| Prefix | Endpoints |
|---|---|
| `/api/v1/auth` | `POST /sign-in`, `POST /sign-up`, `POST /forgot-password`, `POST /reset-password` |
| `/api/v1/users` | `POST /`, `GET /`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}` |
| `/api/v1/recommendation` | `GET /?games=<id,id>&max_price=<float>&resolution=<1080\|1440\|2160>&computer_performance=<level>` |
| `/api/v1/benchmarks` | `POST /`, `GET /`, `POST /filter`, `GET /search`, `GET /users/{user_id}`, `GET /{id}`, `DELETE /{id}` |
| `/api/v1/games` | `POST /`, `GET /`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}` |
| `/api/v1/hardware/{cpus,gpus,rams,motherboards,psus,ssds}` | `POST /`, `GET /`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}` |

Protected routes expect `Authorization: Bearer <token>`, where the token comes from
`POST /api/v1/auth/sign-in`.

### Permissions

The gateway validates the JWT and forwards `x-user-id` / `x-user-role` as gRPC
metadata; role checks are done by the microservices. Roles are `admin`, `supervisor`
and `common`.

| Operation | Requirement |
|---|---|
| `auth/*`, `GET` on games / hardware / benchmarks, `POST /benchmarks/filter`, `GET /recommendation` | None (public) |
| `POST` / `DELETE` games and hardware | `admin` or `supervisor` |
| `PATCH` games and hardware | Any valid token (no role check) |
| `POST` / `DELETE` benchmarks | Any valid token |
| `POST /users` | `admin` |
| `GET /users`, `GET /users/{id}` | Any valid token |
| `PATCH` / `DELETE /users/{id}` | The user themself or an `admin` (only an admin can change roles) |

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}' | jq -r .token)

curl -s http://localhost:3000/api/v1/hardware/cpus -H "Authorization: Bearer $TOKEN" | jq

curl -s -G http://localhost:3000/api/v1/recommendation \
  -H "Authorization: Bearer $TOKEN" \
  --data-urlencode "games=<game-id-1>,<game-id-2>" \
  --data-urlencode "max_price=8000" \
  --data-urlencode "resolution=1440" \
  --data-urlencode "computer_performance=high" | jq
```

`games` is a comma-separated list of game IDs, because `serde_urlencoded` does not
support repeated list parameters.

## Repository layout

```
build-a-computer/
├── api_gateway/                    # Rust · axum HTTP API, gRPC clients, JWT extractor
├── authentication_microservice/    # Rust · hexagonal auth service + admin CLI
├── recommendation_microservice/    # Go · hexagonal PC builder service
├── benchmark_microservice/         # Java · Spring Boot gRPC catalog & benchmarks
├── frontend/                       # Next.js app (feature-sliced under src/features)
├── proto/                          # Shared gRPC contracts
├── scripts/seed-databases.sh       # Bootstrap admin + seed catalog data
├── docker-compose.yml              # Production-ish stack
├── docker-compose.dev.yml          # Dev stack (fixed host ports, gateway Dockerfile.dev)
└── .github/workflows/deploy.yml    # SSH deploy on push to main
```

Each service keeps its own README with a detailed file-by-file architecture:
[`api_gateway`](api_gateway/README.MD),
[`authentication_microservice`](authentication_microservice/README.MD),
[`recommendation_microservice`](recommendation_microservice/README.md).

## Development

The Rust services compile `proto/` through `build.rs`, and the Java service through
the Gradle protobuf plugin — both pick changes up on the next build.

The Go service uses its own copy of the recommendation protos. After changing
`proto/recommendation/`, copy the change into `recommendation_microservice/pkg/protos/`
(keeping the `go_package` option) and regenerate the committed stubs:

```bash
cd recommendation_microservice
task proto-gen          # protoc -I pkg/protos ... pkg/protos/*.proto
```

Authentication service database workflow (sqlx):

```bash
cd authentication_microservice
sqlx database create
cargo sqlx migrate run
cargo sqlx prepare
```

Benchmark service schema changes go into a new Flyway migration in
`benchmark_microservice/src/main/resources/db/migration`.

### Commit convention

The repository ships a commit template (`.gitmessage`) following
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) with an
uppercase type and a short scope:

```
FEAT :: SHORT DESCRIPTIVE TITLE
```

```bash
git config commit.template .gitmessage
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which connects to the
server over SSH and runs `git pull origin main && docker compose up -d --build` in
`~/build-a-computer`. It requires the `SERVER_HOST`, `SERVER_USER` and
`SSH_PRIVATE_KEY` repository secrets, and a `.env` already present in that directory
on the server.

## Authors

- Erick Oda Coulter
- Lorenzo Vicentin
- Raphael Z. Cali
