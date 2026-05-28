# Microsserviço de Autenticação (Rust)

Este projeto implementa um microsserviço de autenticação robusto utilizando a linguagem **Rust**, seguindo os princípios de **Arquitetura Hexagonal (Ports and Adapters)** e **Domain-Driven Design (DDD)**.

A arquitetura foi desenhada para garantir o isolamento da lógica de negócio em relação a detalhes de infraestrutura, como frameworks web, bases de dados e bibliotecas de criptografia.

## Useful Commands
Create Admin User
```bash
cargo run --release --bin cli -- create-admin --username "admin" --email "admin@email.com
```

Create Supervisor User
```bash
curl -i -X POST http://localhost:8080/api/v1/user \
    -H "Content-Type: application/json" \
    -d '{"username": "Second User", "email": "second_user@email.com", "password": "AlgumaSenha123#", "role": "supervisor"}'
```

Authenticate Admin User
```bash
curl -i -X POST http://localhost:8080/api/v1/auth \
    -H "Content-Type: application/json" \
    -d '{"email": "user@email.com", "password": "AlgumaSenha123#"}'
```

Authenticate Supervisor User
```bash
curl -i -X POST http://localhost:8080/api/v1/auth \
    -H "Content-Type: application/json" \
    -d '{"email": "second_user@email.com", "password": "AlgumaSenha123#"}'
```

Get Users
```bash
curl -i -X GET http://localhost:8080/api/v1/user \
    -H "Authorization: Bearer {{TOKEN}}" \
    -H "Content-Type: application/json"
```

Get User
```bash
curl -i -X GET http://localhost:8080/api/v1/user/{{id_usuário}} \
    -H "Authorization: Bearer {{TOKEN}}" \
    -H "Content-Type: application/json"
```

Delete User
```bash
curl -i -X DELETE http://localhost:8080/api/v1/user/{{id_usuário}} \
    -H "Authorization: Bearer {{TOKEN}}" \
    -H "Content-Type: application/json"
```

## Setup database with sqlx
```bash
sqlx database create   # Create the database
cargo sqlx migrate run # Run migrations
cargo sqlx prepare     # Create / Update .sqlx
```

## 🛠️ Stack Tecnológica

As dependências principais utilizadas são:

- **Web Framework:** [actix-web](https://actix.rs/)
- **Base de Dados:** [sqlx](https://github.com/launchbadge/sqlx) (PostgreSQL)
- **Segurança:** [argon2](https://crates.io/crates/argon2) (Hashing), [jsonwebtoken](https://github.com/Keats/jsonwebtoken) (JWT)
- **Serialização:** [serde](https://serde.rs/), [serde_json](https://github.com/serde-rs/json)
- **Utilidades:** [uuid](https://crates.io/crates/uuid), [regex](https://crates.io/crates/regex), [dotenvy](https://github.com/allan2/dotenvy)

## 🏗️ File Architecture

```text
src/
├── cli.rs                          # Ponto de entrada e configuração do binário CLI
├── config.rs                       # Carregamento de variáveis de ambiente
├── grpc_server.rs                  # Ponto de entrada e configuração do servidor gRPC
├── http_server.rs                  # Ponto de entrada e configuração do servidor HTTP (Actix)
├── lib.rs                          # Exportação dos módulos principais do projeto
├── application/                    # Casos de Uso e Portas (Regras da aplicação)
│   ├── mod.rs
│   ├── errors.rs 
│   ├── commands/                   # Comandos de entrada (DTOs de Input)
│   │   ├── mod.rs
│   │   ├── auth.rs                 # Estruturas de entrada para autenticação (Login)
│   │   └── create_user.rs          # Estruturas de entrada para criação de usuário
│   ├── outputs/                    # Estruturas de saída (DTOs de Output)
│   │   ├── mod.rs
│   │   ├── auth.rs                 # Estruturas de resposta de autenticação
│   │   └── user.rs                 # Estruturas de resposta com dados do usuário
│   ├── ports/                      # Traits (Interfaces) requeridas pela aplicação
│   │   ├── mod.rs
│   │   ├── password_hasher.rs      # Trait que define o contrato para criptografar e validar as senhas
│   │   ├── token_generator.rs      # Trait que define o contrato para criar e validar tokens
│   │   └── user_repository.rs      # Trait que define o contrato para persistência de usuários
│   └── use_cases/                  # Orquestração do domínio e portas
│       ├── mod.rs
│       ├── auth.rs                 # Parte da camada de aplicação responsável pela caso de uso de autenticação
│       └── user.rs                 # Parte da camada de aplicação responsável pela caso de uso relacionados aos usuários
├── domain/                         # Core do negócio
│   ├── mod.rs
│   ├── errors.rs                   # Enum de erros de domínio (ex.: InvalidEmail)
│   ├── entities/
│   │   ├── mod.rs
│   │   └── user.rs                 # User (ID, Email, Senha hasheada,...)
│   └── value_objects/
│       ├── mod.rs
│       ├── email.rs                # Value Object encapsulando validação de e-mail
│       ├── hashed_password.rs      # Value Object para senhas já criptografadas
│       ├── plain_password.rs       # Value Object para validação de senhas em texto plano
│       ├── role.rs                 # Value Object de papéis de acesso
│       ├── status.rs               # Value Object para status da conta
│       └── username.rs             # Value Object para regras de nome de usuário
└── infrastructure/                 # Adapter (Implementações concretas das Ports)
    ├── mod.rs
    ├── cli/                        # Primary Adapters (Driving) - Linha de Comando
    │   ├── mod.rs
    │   ├── commands.rs             # Definição das estruturas e argumentos dos comandos CLI
    │   └── execute.rs              # Execução dos comandos
    ├── grpc/                       # Primary Adapters (Driving) - Servidor gRPC
    │   ├── mod.rs
    │   ├── conversions.rs          # Mapeamento entre tipos do gRPC e da Aplicação/Domínio
    │   ├── errors.rs               # Mapeamento e tratamento de erros para Status gRPC
    │   ├── interceptors.rs         # Middlewares gRPC que valida metadados de autenticação
    │   └── services/
    │       ├── mod.rs
    │       ├── auth.rs             # Implementação do serviço de autenticação gRPC
    │       └── users.rs            # Implementação do serviço de gerenciamento de usuários gRPC
    ├── persistence/                # Secondary Adapters (Driven) - Banco de Dados
    │   ├── mod.rs
    │   ├── sqlx_user_repository.rs # Implementa a trait UserRepository usando sqlx
    │   └── model/
    │       ├── mod.rs
    │       └── user_row.rs         # Estrutura de mapeamento direto com as tabelas do BD (sqlx)
    ├── security/                   # Secondary Adapters (Driven) - Hash e JWT
    │   ├── mod.rs
    │   ├── argon2_hasher.rs        # Implementa a trait PasswordHasher
    │   └── jwt_generator.rs        # Implementa a trait TokenGenerator
    └── web/                        # Primary Adapters (Driving) - Servidor HTTP REST
        ├── mod.rs
        ├── errors.rs               # Mapeamento de erros da aplicação para respostas HTTP
        ├── routes.rs               # Configuração das rotas HTTP
        ├── swagger.rs              # Configuração da documentação Swagger
        ├── controllers/            # Handlers do Actix-web
        │   ├── mod.rs
        │   ├── auth.rs             # Recebe requisição, chama Use Case, retorna HTTP Response
        │   └── user.rs             # Recebe requisição, chama Use Case, retorna HTTP Response
        └── extractor/              # Extractors do Actix
            ├── mod.rs
            ├── admin.rs            # Extractor para proteger rotas exigindo privilégio de Admin
            └── authenticated.rs    # Extractor para validar o JWT e proteger rotas logadas
```
## TODO:
- [ ] Code unit tests
- [ ] Code integration tests
- [ ] Code End-to-End tests
- [ ] Code load tests
- [ ] Refine code quality
- [ ] Finish README.MD
- [ ] Create swagger
- [ ] Separate the cli.rs into his own binary
