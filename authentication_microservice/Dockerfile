FROM rust:1.99.0-slim-bookworm AS builder
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
RUN apt-get update && apt-get install --no-install-recommends -y \
  protobuf-compiler \
  pkg-config \
  libssl-dev \
  libprotobuf-dev \
  curl
RUN cargo build --release
RUN rm src/grpc_server.rs

COPY src ./src

RUN touch src/grpc_server.rs
RUN cargo build --release

FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && \
  apt-get install --no-install-recommends -y libpq5 ca-certificates openssl && \
  rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/target/release/grpc_server /usr/local/bin/server
COPY --from=builder /usr/src/app/target/release/cli /usr/local/bin/cli

EXPOSE 50051

RUN useradd --system --no-create-home --uid 10001 app
USER app

CMD ["server"]
