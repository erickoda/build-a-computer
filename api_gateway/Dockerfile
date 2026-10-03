FROM rust:1.99.0-slim-bookworm AS builder
WORKDIR /usr/src/app

COPY Cargo.toml Cargo.lock build.rs ./
COPY --from=protos . ../proto

RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN apt-get update && apt-get install --no-install-recommends -y curl protobuf-compiler libprotobuf-dev
RUN cargo build --release
RUN rm src/main.rs

COPY src ./src
RUN touch src/main.rs
RUN cargo build --release

FROM debian:bookworm-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install --no-install-recommends -y libpq5 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/target/release/api_gateway /usr/local/bin/server

EXPOSE 3000

RUN useradd --system --no-create-home --uid 10001 app
USER app

CMD ["server"]
