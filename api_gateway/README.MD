## 🎯 Project Goals
The main goal of this service is to provide an API Gateway that receives HTTP requests, parse it to gRPC format and send it to the suitable microservice. Then, the microservice must process the incoming request and return a gRPC message that the API Gateway will read and convert to a proper HTTP message that will be sent for the client requester.

TODO List:
- [ ] Create the proto file for auth microservice
- [ ] Create the proto file for benchmark microservice
- [ ] Create the proto file for recommendation microservice
- [ ] Create HTTP <--> gRPC parsers
- [ ] Create the HTTP server
- [ ] Create the gRPC client
- [ ] Create a middleware
- [ ] Mapping errors correctly

## Arquitetura de Arquivos
```
api-gateway/
├── build.rs                      # Script de build para compilar os .proto antes do código Rust
├── Cargo.toml                    # Dependências e metadados do projeto
├── .env                          # Variáveis de ambiente locais
├── proto/                        # Contratos gRPC (IDLs) centralizados
│   ├── auth.proto
│   └── users.proto
└── src/
    ├── main.rs                   # Ponto de entrada: inicializa telemetria, config e sobe o servidor Axum
    ├── config.rs                 # Carregamento de env vars usando a crate `config` ou `dotenvy`
    ├── error.rs                  # Mapeamento de erros globais com `thiserror` e custom Axum Rejection
    ├── telemetry.rs              # Setup do `tracing` (formatação JSON, stdout, exportação OTLP)
    ├── extractor
    │   ├── mod.rs
    │   └── auth.rs               # Intercepta requisições, valida JWT e injeta Claims no request
    ├── middleware/               # Middlewares Tower compartilhados
    │   ├── mod.rs
    │   ├── rate_limit.rs         # Controle de tráfego por IP/Token
    │   └── logger.rs             # Tracing spans customizados para auditoria HTTP
    ├── clients/                  # Infraestrutura e clientes gRPC
    │   ├── mod.rs
    │   ├── channel.rs            # Gerenciamento do `tonic::transport::Channel` (Multiplexing)
    │   └── user_client.rs        # Wrapper do client gRPC para isolar a complexidade do Tonic
    └── modules/                  # Domínios da aplicação (Vertical Slicing)
        ├── mod.rs
        └── users/                # Exemplo de um módulo: "Usuários"
            ├── mod.rs
            ├── routes.rs         # Roteador Axum específico deste domínio (ex: /api/v1/users)
            ├── handlers.rs       # Controladores: Recebem JSON, chamam o client gRPC, retornam JSON
            ├── dto.rs            # Structs Serde para validação de payload de entrada e saída
            └── mapper.rs         # Lógica de conversão: DTO (JSON) <-> Protobuf Structs
```
