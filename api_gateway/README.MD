## 🎯 Project Goals
The main goal of this service is to provide an API Gateway that receives HTTP requests, parse it to gRPC format and send it to the suitable microservice. Then, the microservice must process the incoming request and return a gRPC message that the API Gateway will read and convert to a proper HTTP message that will be sent for the client requester.

TODO List:
- [x] Create the proto file for auth microservice
- [ ] Create the proto file for benchmark microservice
- [ ] Create the proto file for recommendation microservice
- [ ] Create HTTP <--> gRPC parsers
- [ ] Create the HTTP server
- [ ] Create the gRPC client
- [x] Create the auth extractor
- [x] Mapping errors correctly

## File Architecture
```
api-gateway/
├── build.rs                      # Build script that compiles the .proto files before the Rust code itself
├── Cargo.toml                    # Project dependencies
├── .env                          # Local environment variables
└── src/
    ├── main.rs                   # Entry point: configure app, connect to microservices and run the API Gateway
    ├── config.rs                 # Load environment variables using 'config' and 'dotenvy' crates
    ├── errors.rs                 # Mapping Global errors and conversion between gRPC errors into HTTP 
    ├── telemetry.rs              # Todo: Telemetry should control the application logs
    ├── clients/                  # Handle the gRPC clients
    │   ├── mod.rs
    │   ├── metadata.rs           # Insert auth metadata into gRPC request
    │   ├── channel.rs            # Create and configure the HTTP/2 connection that gRPC uses
    │   └── user_client.rs        # gRPC User's Client Wrapper to isolate Tonic implementation
    ├── extractor                 # Extract data from http requests
    │   ├── mod.rs
    │   └── auth.rs               # Intercept request, validate the JWT and inject Claims into the request
    ├── modules/                  # Http requests handlers
    │   ├── mod.rs
    │   └── auth/                 # Auth module
    │   │   ├── mod.rs
    │   │   ├── routes.rs         # Create the endpoints for authentication module
    │   │   ├── handlers.rs       # Handlers: Receive the DTO, call the gRPC client, and returns the suitable DTO
    │   │   └── dto               # Structs for validation of input/output payloads (JSON - HTTP)
    │   │       ├── mod.rs
    │   │       ├── request/
    │   │       │   ├── mod.rs
    │   │       │   └── auth.rs
    │   │       └── response/
    │   │           ├── mod.rs
    │   │           └── auth.rs
    │   └── users/                # User Module
    │       ├── mod.rs
    │       ├── routes.rs         # Create the endpoints for users module
    │       ├── handlers.rs       # Handlers: Receive the DTO, call the gRPC client, and returns the suitable DTO
    │       ├── mapper.rs         # Conversion logic: DTO (JSON) <-> Protobuf Structs
    │       └── dto               # Structs for validation of input/output payloads (JSON - HTTP)
    │           ├── mod.rs 
    │           ├── user_role.rs  
    │           ├── user_status.rs 
    │           ├── request/ 
    │           │   ├── mod.rs
    │           │   └── create_user.rs 
    │           └── response/ 
    │               ├── mod.rs
    │               └── user.rs 
    ├── security/                 # Security
    │   ├── mod.rs
    │   ├── jwt_adapter.rs        # 
    │   └── token.rs              # 
    └── middleware/               # TODO: middlewares for traffic control and log http requests
        ├── mod.rs
        ├── rate_limit.rs         # Controle de tráfego por IP/Token
        └── logger.rs             # Tracing spans customizados para auditoria HTTP
```
