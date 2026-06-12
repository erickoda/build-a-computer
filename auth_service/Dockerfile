FROM rust:1.95.0-slim-bullseye AS builder
WORKDIR /usr/src/app

COPY Cargo.toml Cargo.lock build.rs ./
COPY --from=protos . ../proto

COPY /migrations ./migrations 
COPY /.sqlx ./.sqlx
ENV SQLX_OFFLINE=true

RUN mkdir src && \
  echo "fn main() {}" > src/grpc_server.rs && \
  echo "fn main() {}" > src/cli.rs && \
  echo "" > src/lib.rs
RUN apt-get update && apt-get install -y \
  curl \
  protobuf-compiler \
  pkg-config \
  libssl-dev
RUN cargo build --release
RUN rm src/grpc_server.rs

COPY src ./src

RUN touch src/grpc_server.rs
RUN cargo build --release

FROM debian:bullseye-slim

WORKDIR /app

RUN apt-get update && \
  apt-get install -y libpq-dev ca-certificates openssl && \
  rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/target/release/grpc_server /usr/local/bin/server
COPY --from=builder /usr/src/app/target/release/cli /usr/local/bin/cli

EXPOSE 50051

CMD ["server"]
