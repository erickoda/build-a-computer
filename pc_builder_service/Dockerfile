FROM golang:1.26.3 AS build-stage

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o pc_builder_service cmd/server/main.go

FROM scratch AS run-stage

WORKDIR /app

COPY --from=build-stage /app/pc_builder_service .

EXPOSE 50051

CMD ["./pc_builder_service"]
