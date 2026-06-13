FROM golang:1.26.3 AS build-stage

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o pc_builder_service cmd/server/main.go

FROM alpine:3.23 AS security-provider
RUN adduser -D -g '' -u 10001 appuser

FROM scratch AS run-stage

WORKDIR /app

COPY --from=build-stage /app/pc_builder_service .
COPY --from=security-provider /etc/passwd /etc/passwd
COPY --from=security-provider /etc/group /etc/group

EXPOSE 50051

USER appuser
CMD ["./pc_builder_service"]
