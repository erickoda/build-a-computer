# API Gateway (Rust)

The single HTTP entry point of Build a Computer. It receives REST/JSON requests,
validates the caller's JWT, translates each request into a gRPC call to the right
microservice and maps the gRPC reply (or error) back into an HTTP response. It also
serves the OpenAPI specification and a Swagger UI.

Built with **axum** (HTTP), **tonic** (gRPC clients), **jsonwebtoken** and **utoipa**.

## How it works

```
HTTP request
  │
  ├─ TraceLayer          logs method, URI, user id (decoded from the Bearer token), status and latency
  ├─ CorsLayer           any origin / any method, Authorization + Content-Type headers
  │
  ├─ route handler
  │    ├─ AuthenticatedUser extractor (protected routes only)
  │    │    validates "Authorization: Bearer <jwt>" with JWT_SECRET → { id, role }
  │    ├─ DTO → protobuf  (mappers.rs)
  │    ├─ with_auth_metadata()  adds x-user-id / x-user-role to the gRPC metadata
  │    └─ gRPC client wrapper → microservice
  │
  └─ AppError → HTTP status (errors.rs)
```

- The gateway only checks that the token is valid. **Role checks are done by the
  microservices**, using the `x-user-id` / `x-user-role` metadata the gateway forwards.
- All gRPC channels are opened at startup (`clients/channel.rs`) with a 5 s request
  timeout, a 256-request concurrency limit and 60 s TCP keepalive. If a microservice
  is not reachable at startup, the gateway exits.
- The benchmark microservice hosts several gRPC services (benchmarks, games and the six
  hardware services); they all share one channel.
- gRPC status codes are converted to HTTP in `errors.rs` (e.g. `InvalidArgument` → 400,
  `Unauthenticated` → 401, `PermissionDenied` → 403, `NotFound` → 404,
  `AlreadyExists` → 409, `Unavailable` → 503).

## Routes

Every route lives under `/api/v1`. The full request/response schemas are in the
Swagger UI.

| Prefix | Endpoints | Upstream service |
|---|---|---|
| `/auth` | `POST /sign-in`, `POST /sign-up`, `POST /forgot-password`, `POST /reset-password` | authentication (`auth.Auth`) |
| `/users` | `POST /`, `GET /`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}` | authentication (`user.Users`) |
| `/recommendation` | `GET /?games=&max_price=&resolution=&computer_performance=` | recommendation (`BuilderService`) |
| `/benchmarks` | `POST /`, `GET /`, `POST /filter`, `GET /search`, `GET /users/{user_id}`, `GET /{id}`, `DELETE /{id}` | benchmark (`BenchmarkService`) |
| `/games` | `POST /`, `GET /`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}` | benchmark (`GameService`) |
| `/hardware/{cpus,gpus,rams,motherboards,psus,ssds}` | `POST /`, `GET /`, `GET /{id}`, `PATCH /{id}`, `DELETE /{id}` | benchmark (`CPUService`, `GPUService`, …) |

Documentation:

- Swagger UI — `http://localhost:3000/swagger-ui`
- OpenAPI JSON — `http://localhost:3000/api-docs/openapi.json`

## Configuration

Read from the environment (a local `.env` is loaded with `dotenvy`):

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | — (required) | Secret shared with the authentication microservice to validate tokens |
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `3000` | HTTP port |
| `AUTH_MICROSERVICE_URL` | `http://127.0.0.1:50051` | Auth gRPC server |
| `USERS_MICROSERVICE_URL` | `http://127.0.0.1:50051` | Users gRPC server (same process as auth) |
| `RECOMMENDATION_MICROSERVICE_URL` | `http://127.0.0.1:50052` | Recommendation gRPC server |
| `BENCHMARK_MICROSERVICE_URL` | `http://127.0.0.1:50053` | Benchmark gRPC server |
| `RUST_LOG` | `info` | Log filter (`tracing-subscriber` `EnvFilter`) |

## Running

With the whole stack (from the repository root):

```bash
docker compose up -d --build api_gateway
```

Locally (the microservices must already be running and reachable):

```bash
cargo run
```

`build.rs` compiles the protos from `../proto` with `tonic-prost-build`, so `protoc`
must be installed. The Docker image receives `proto/` through the `protos` additional
build context. `Dockerfile` builds in release mode; `Dockerfile.dev` (used by
`docker-compose.dev.yml`) builds in debug mode for faster rebuilds.

## Examples

```bash
# Sign in (the first admin is created through the authentication microservice CLI)
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "Admin123!"}' | jq -r .token)

# Create a supervisor (admin only)
curl -i -X POST http://localhost:3000/api/v1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "Second User", "email": "second_user@email.com", "password": "SomePassword123#", "role": "supervisor"}'

# List / get / delete users
curl -s http://localhost:3000/api/v1/users -H "Authorization: Bearer $TOKEN" | jq
curl -s http://localhost:3000/api/v1/users/<user-id> -H "Authorization: Bearer $TOKEN" | jq
curl -i -X DELETE http://localhost:3000/api/v1/users/<user-id> -H "Authorization: Bearer $TOKEN"

# Ask for a recommendation (games is a comma-separated list of game IDs)
curl -s -G http://localhost:3000/api/v1/recommendation \
  --data-urlencode "games=<game-id-1>,<game-id-2>" \
  --data-urlencode "max_price=8000" \
  --data-urlencode "resolution=1440" \
  --data-urlencode "computer_performance=high" | jq
```

## File architecture

```
api_gateway/
├── build.rs                    # Compiles ../proto (auth, user, recommendation, benchmark, game) before the crate
├── Cargo.toml
├── Dockerfile                  # Release build
├── Dockerfile.dev              # Debug build (docker-compose.dev.yml)
└── src/
    ├── main.rs                 # Opens the gRPC channels, builds AppState, mounts routes, CORS, tracing and Swagger
    ├── config.rs               # AppConfig loaded from the environment
    ├── errors.rs               # AppError and gRPC status → HTTP status mapping
    ├── swagger.rs              # Root OpenAPI document + Bearer JWT security scheme
    ├── tracing_config.rs       # tracing-subscriber setup (RUST_LOG)
    ├── clients/                # Thin wrappers around the tonic clients
    │   ├── channel.rs          # Shared channel factory (timeout, concurrency limit, keepalive)
    │   ├── metadata.rs         # with_auth_metadata(): injects x-user-id / x-user-role
    │   ├── auth_client.rs
    │   ├── users_client.rs
    │   ├── recommendation_client.rs
    │   ├── benchmark_client.rs
    │   ├── game_client.rs
    │   └── {cpu,gpu,ram,motherboard,psu,ssd}_client.rs
    ├── extractor/
    │   └── auth.rs             # AuthenticatedUser extractor: validates the Bearer token
    ├── middleware/
    │   └── tracing.rs          # TraceLayer: request span with the user id, status and latency
    ├── security/
    │   ├── token.rs            # TokenValidator trait + AuthenticatedUser
    │   └── jwt_adapter.rs      # JwtValidator (HS256, JWT_SECRET)
    └── modules/                # One folder per resource
        ├── auth/
        ├── users/
        ├── recommendation/
        ├── benchmark/
        ├── game/
        └── hardware/{cpu,gpu,ram,motherboard,psu,ssd}/
```

Every module follows the same layout:

```
<module>/
├── routes.rs     # axum Router for the resource
├── handlers.rs   # Extract DTO/user → call the gRPC client → return the response DTO
├── mappers.rs    # DTO (JSON) ⇄ protobuf conversions
├── swagger.rs    # utoipa OpenApi fragment merged in main.rs
└── dtos/
    ├── request/  # Input payloads / query params
    └── response/ # Output payloads
```

## Adding a new endpoint

1. Add the RPC to the `.proto` file in `../proto` (and to `build.rs` if it is a new file).
2. Add a method to the matching client wrapper in `src/clients/`.
3. Create the request/response DTOs and the mapper in the module.
4. Write the handler (take `AuthenticatedUser` as an argument if the route needs a
   token, and wrap the payload with `with_auth_metadata`).
5. Register the route in `routes.rs` and the path/schemas in `swagger.rs`.
