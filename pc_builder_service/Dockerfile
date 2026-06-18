FROM golang:1.26.3-alpine AS build-stage

RUN apk update && \
    apk add --no-cache protoc protobuf-dev curl unzip git

RUN GOPROXY=direct go install google.golang.org/protobuf/cmd/protoc-gen-go@latest \
    && GOPROXY=direct go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN protoc -I pkg/protos --experimental_allow_proto3_optional --go_out=. \
    --go_opt=module=github.com/erickoda/build-a-computer/pc_builder_service \
    --go-grpc_out=. \
    --go-grpc_opt=module=github.com/erickoda/build-a-computer/pc_builder_service \
    pkg/protos/*.proto

RUN CGO_ENABLED=0 GOOS=linux go build -o pc_builder_service cmd/server/main.go

FROM alpine:3.23 AS security-provider
RUN adduser -D -g '' -u 10001 appuser

FROM alpine:3.23 AS run-stage

RUN apk add --no-cache bash

WORKDIR /app

COPY --from=build-stage /app/pc_builder_service .
COPY --from=security-provider /etc/passwd /etc/passwd
COPY --from=security-provider /etc/group /etc/group

EXPOSE 50052

USER appuser
CMD ["./pc_builder_service"]
