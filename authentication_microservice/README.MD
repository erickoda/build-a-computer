# Authentication Microservice (Rust)

gRPC service that owns user accounts: sign-up, sign-in (JWT issuing), password reset
through an e-mail OTP, and user management. It also ships a small CLI used to create
the first administrator.

It follows **Hexagonal Architecture (Ports and Adapters)** with **Domain-Driven
Design**: the domain and application layers do not depend on tonic, sqlx, Argon2,
JWT or SMTP. Those are adapters that implement the application's ports.

Built with **tonic**, **sqlx** (PostgreSQL), **argon2**, **jsonwebtoken**, **lettre**
and **clap**.

## gRPC services

Contracts: [`proto/auth/auth.proto`](../proto/auth/auth.proto) and
[`proto/user/user.proto`](../proto/user/user.proto). Default port: `50051`.

### `auth.Auth` (public)

| RPC | Description |
|---|---|
| `SignIn` | Checks e-mail + password and returns a JWT |
| `SignUp` | Creates a `common` user and returns a JWT |
| `ForgotPassword` | Generates a 6-character OTP, keeps it for 10 minutes and e-mails it |
| `ResetPassword` | Validates the OTP and sets the new password |

### `user.Users` (requires `x-user-id` / `x-user-role` metadata)

A gRPC interceptor (`infrastructure/grpc/interceptors.rs`) rejects the call with
`UNAUTHENTICATED` if the metadata is missing or malformed. The API Gateway sets it
from the validated JWT.

| RPC | Who can call it |
|---|---|
| `CreateUser` | `admin` |
| `GetUser`, `GetUsers` | Any authenticated user |
| `UpdateUser` | The user themself or an `admin`; only an `admin` can change roles |
| `DeleteUser` | The user themself or an `admin` |

`DeleteUser` is a soft delete: it sets the status to `inactive`. Only `active` users
are returned by the queries and can sign in.

## Domain rules

- **Roles:** `admin`, `supervisor`, `common`. Sign-up always creates `common`.
- **Status:** `active`, `inactive`, `banned`.
- **Password:** 8–24 characters, at least one uppercase letter and one special
  character. Stored as an Argon2 hash.
- **Username:** at most 255 characters. **E-mail:** validated and unique.
- **JWT:** claims `sub` (user id), `role` and `exp`, signed with `JWT_SECRET`. It
  expires after `JWT_EXPIRATION` seconds.
- **OTP:** stored in memory (`infrastructure/otp/in_memory.rs`). Codes are lost when
  the service restarts and are not shared between replicas.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — (required) | PostgreSQL connection string |
| `JWT_SECRET` | — (required) | Token signing secret (must match the gateway) |
| `JWT_EXPIRATION` | — (required) | Token lifetime in seconds |
| `SMTP_USERNAME` | — (required) | Gmail address used to send OTP e-mails |
| `SMTP_PASSWORD` | — (required) | Gmail app password |
| `HOST` | `0.0.0.0` | Bind address |
| `PORT` | `50051` | gRPC port |
| `RUST_LOG` | — | Log filter |

In `docker-compose.yml` these come from the root `.env` (`AUTH_MICROSERVICE_*`
variables, e.g. `AUTH_MICROSERVICE_USERS_DATABASE_URL` → `DATABASE_URL`).

## Running

With the whole stack (from the repository root):

```bash
docker compose up -d --build authentication_microservice
```

Locally, with a `.env` in this folder and a running PostgreSQL:

```bash
cargo run --bin grpc_server
```

Migrations in `migrations/` run automatically at startup (`sqlx::migrate!`).
`build.rs` compiles the protos from `../proto`, so `protoc` must be installed.

## Creating the first admin

Sign-up only creates `common` users, so the first `admin` is created with the CLI
binary. The password is read from the terminal without echoing it.

```bash
# Inside Docker
docker compose exec authentication_microservice cli create-admin \
  --username admin --email admin@example.com

# Locally
cargo run --bin cli -- create-admin --username admin --email admin@example.com
```

`scripts/seed-databases.sh` at the repository root runs this step for you.

## Database (sqlx)

Queries are checked at compile time. The Docker build uses offline mode
(`SQLX_OFFLINE=true` with the committed `.sqlx/` folder), so run `cargo sqlx prepare`
after changing a query or a migration.

```bash
sqlx database create     # Create the database from DATABASE_URL
cargo sqlx migrate run   # Apply migrations
cargo sqlx prepare       # Regenerate .sqlx/ for offline builds
```

## Tests

Unit tests cover the use cases (with `mockall` mocks of the ports), the commands and
the value objects:

```bash
cargo test
```

## File architecture

```
authentication_microservice/
├── build.rs                        # Compiles ../proto/auth and ../proto/user
├── Cargo.toml                      # Library (auth_service) + two binaries: grpc_server and cli
├── Dockerfile
├── migrations/
│   └── 00000001_create_users_table.sql
└── src/
    ├── grpc_server.rs              # Entry point: wires adapters into use cases and starts the gRPC server
    ├── cli.rs                      # Entry point of the admin CLI
    ├── lib.rs                      # Exports the modules and the generated gRPC code
    ├── config.rs                   # AppConfig loaded from the environment
    ├── tracing_config.rs           # tracing-subscriber setup
    ├── domain/                     # Business core, no infrastructure dependencies
    │   ├── errors.rs               # Domain errors (invalid e-mail, password, …)
    │   ├── entities/
    │   │   └── user.rs             # UserEntity
    │   └── value_objects/
    │       ├── email.rs
    │       ├── username.rs
    │       ├── plain_password.rs   # Password strength rules
    │       ├── hashed_password.rs
    │       ├── role.rs             # admin / supervisor / common
    │       └── status.rs           # active / inactive / banned
    ├── application/                # Use cases and ports
    │   ├── errors.rs
    │   ├── commands/               # Input DTOs
    │   │   ├── sign_in.rs
    │   │   ├── sign_up.rs
    │   │   ├── forgot_password.rs
    │   │   ├── reset_password.rs
    │   │   ├── create_user.rs
    │   │   └── update_user.rs
    │   ├── outputs/                # Output DTOs
    │   │   ├── auth.rs
    │   │   └── user.rs
    │   ├── ports/                  # Traits implemented by the infrastructure
    │   │   ├── user_repository.rs
    │   │   ├── password_hasher.rs
    │   │   ├── token_generator.rs
    │   │   ├── email_sender.rs
    │   │   └── otp_store.rs
    │   └── use_cases/
    │       ├── auth.rs             # Sign-in, sign-up, forgot/reset password
    │       └── user.rs             # User CRUD and permission rules
    └── infrastructure/             # Adapters
        ├── grpc/                   # Driving adapter: gRPC server
        │   ├── interceptors.rs     # Reads x-user-id / x-user-role into a UserContext
        │   ├── errors.rs           # Application errors → gRPC Status
        │   ├── conversions/        # Protobuf ⇄ application types
        │   │   ├── auth.rs
        │   │   └── users.rs
        │   └── services/
        │       ├── auth.rs         # auth.Auth implementation
        │       └── users.rs        # user.Users implementation
        ├── cli/                    # Driving adapter: command line
        │   ├── commands.rs         # clap definitions
        │   └── execute.rs          # create-admin flow
        ├── persistence/            # Driven adapter: PostgreSQL
        │   ├── sqlx_user_repository.rs
        │   └── models/
        │       └── user_row.rs     # Row mapping and Postgres enums
        ├── security/               # Driven adapter: hashing and tokens
        │   ├── argo2_cryptography.rs   # PasswordHasher with Argon2
        │   └── jwt_generator.rs        # TokenGenerator with JWT
        ├── email/
        │   └── gmail_sender.rs     # EmailSender over Gmail SMTP (lettre)
        └── otp/
            └── in_memory.rs        # OtpStore with a TTL, kept in memory
```

## TODO

- [x] Unit tests
- [ ] Integration tests
- [x] Separate the CLI into its own binary
- [ ] Persist OTP codes outside the process memory
