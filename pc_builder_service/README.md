# Microsserviço que Recomenda um Computador (Go)

Este projeto implementa um microsserviço em **Go** que recomenda um computador com base nos jogos que o usuário gostaria de jogar,
seguindo os princípios de **Arquitetura Hexagonal (Ports and Adapters)** e **Domain-Driven Design (DDD)**.

A arquitetura foi desenhada para garantir o isolamento da lógica de negócio em relação a detalhes de infraestrutura, como o framework gRPC, bases de dados e bibliotecas de injeção de dependência.

## Useful Commands
Iniciar Aplicação e Banco de Dados
```bash
docker-compose up -d
```

Gerar Protocolo gRPC
```bash
protoc -I pkg/protos --experimental_allow_proto3_optional --go_out=. --go_opt=module=github.com/erickoda/build-a-computer/pc_builder_service \
--go-grpc_out=. --go-grpc_opt=module=github.com/erickoda/build-a-computer/pc_builder_service pkg/protos/*.proto
```

Gerar Binário
```bash
go build -o bin/server cmd/server/main.go
```

## 🛠️ Stack Tecnológica

As dependências principais utilizadas são:

- **gRPC:** [protoc](https://https://pkg.go.dev/google.golang.org/grpc)
- **Base de Dados:** [gorm](https://gorm.io/)
- **Injeção de Dependência** [uber.fx](https://pkg.go.dev/go.uber.org/fx)

## 🏗️ File Architecture
```text
pc_builder_service/
├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── adapters/                               # Secundary Adapters (Driving)
│   │   ├── db/
│   │   │   ├── benchmark_repository.go         # Implementa a interface de repositório para Benchmark usando gorm
│   │   │   ├── cpu_repository.go               # Implementa a interface de repositório para CPU usando gorm
│   │   │   ├── db.go                           # Configuração e inicialização do banco de dados
│   │   │   ├── errors.go                       # Definição de erros
│   │   │   ├── games_repository.go             # Implementa a interface de repositório para Games usando gorm
│   │   │   ├── gpu_repository.go               # Implementa a interface de repositório para GPU usando gorm
│   │   │   ├── mother_board_repository.go      # Implementa a interface de repositório para MotherBoard usando gorm
│   │   │   ├── power_source_repository.go      # Implementa a interface de repositório para PowerSource usando gorm
│   │   │   ├── ram_memory_repository.go        # Implementa a interface de repositório para RamMemory usando gorm
│   │   │   └── ssd_repository.go               # Implementa a interface de repositório para SSD usando gorm
│   │   └── grpc/                               # Primary Adapters (Driving)
│   │       └── builder_handler.go              # Implementa o gRPC handler para o serviço de builder 
│   ├── app/
│   │   └── modelues.go                         # Injeção de dependências
│   ├── domain/                                 # Domínio da aplicação
│   │   ├── enums/
│   │   │   ├── computer_performance.go         # Enum que define o desempenho esperado do computador e a média de gráficos de um jogo
│   │   │   ├── power_source_ranking.go         # Enum que define o ranking de uma fonte de alimentação
│   │   │   └── ssd_type.go                     # Enum que define o tipo de SSD
│   │   ├── models/                             # Entidades do domínio
│   │   │   ├── benchmark.go
│   │   │   ├── cpu.go
│   │   │   ├── game.go
│   │   │   ├── gpu.go
│   │   │   ├── mother_board.go
│   │   │   ├── pc.go
│   │   │   ├── power_source.go
│   │   │   ├── ram_memory.go
│   │   │   └── ssd.go
│   ├── ports/                                 
│   │   │   ├── benchmark.go                    # Interface que define o contrato para o repository de benchmarking
│   │   │   ├── builder.go                      # Interface que define o contrato para o serviço de construção de PCs
│   │   │   ├── cpu.go                          # Interface que define o contrato para o repository de CPU
│   │   │   ├── game.go                         # Interface que define o contrato para o repository de jogos
│   │   │   ├── gpu.go                          # Interface que define o contrato para o repository de GPU
│   │   │   ├── mother_board.go                 # Interface que define o contrato para o repository de placa-mãe
│   │   │   ├── power_source.go                 # Interface que define o contrato para o repository de fonte de alimentação
│   │   │   ├── ram_memory.go                   # Interface que define o contrato para o repository de memória RAM
│   │   │   └── ssd.go                          # Interface que define o contrato para o repository de SSD
│   └── services/
│       └── builder_service.go                  # Serviço que lida com a lógica de construção de PCs
│       
└── pkg/
    └── protos/
```