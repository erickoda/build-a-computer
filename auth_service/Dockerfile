FROM rust:1.95.0-slim-bullseye AS builder
WORKDIR /usr/src/app

COPY Cargo.toml Cargo.lock ./

RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm src/main.rs

COPY src ./src

RUN touch src/main.rs
RUN cargo build --release

FROM debian:bullseye-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y libpq-dev ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/target/release/auth_service /usr/local/bin/server

EXPOSE 8080

CMD ["server"]