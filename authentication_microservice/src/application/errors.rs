use std::fmt::Display;

use crate::{
    application::ports::{
        email_sender::EmailSenderError, otp_store::OtpStoreError,
        password_hasher::PasswordHasherError, user_repository::RepositoryError,
    },
    domain::errors::UserEntityError,
};

/// Erros mapeados para os fluxos de gerenciamento de usuários (User Use Cases).
///
/// Atua como uma camada de tradução, convertendo falhas específicas de infraestrutura
/// (como falhas no banco de dados) e de domínio (regras de negócio) em respostas
/// semânticas padronizadas para as camadas externas.
pub enum UserUseCaseError {
    /// Ocorre quando os dados fornecidos violam alguma regra de negócio.
    ValidationError(String),
    /// Ocorre quando há violação de unicidade (ex.: e-mail já cadastrado).
    Conflict(String),
    /// Ocorre quando o recurso solicitado não existe.
    NotFound,
    /// Ocorre quando o usuário não possui privilégios suficientes para a ação.
    Forbidden,
    /// Ocorre em falhas inesperadas de infraestrutura.
    InternalError(String),
}

impl std::fmt::Display for UserUseCaseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            UserUseCaseError::Conflict(error) => write!(f, "Conflict Error: {}", error),
            UserUseCaseError::InternalError(error) => write!(f, "Internal App Error: {}", error),
            UserUseCaseError::ValidationError(error) => {
                write!(f, "Invalid Request Format: {}", error)
            }
            UserUseCaseError::NotFound => write!(f, "Resource not found"),
            UserUseCaseError::Forbidden => write!(f, "Forbidden action"),
        }
    }
}

impl From<RepositoryError> for UserUseCaseError {
    fn from(err: RepositoryError) -> Self {
        match err {
            RepositoryError::DuplicatedColumn => Self::Conflict("Email is already in use".into()),
            RepositoryError::NotFound => Self::NotFound,
            RepositoryError::Unexpected(msg) => {
                Self::InternalError(format!("Database error: {}", msg))
            }
        }
    }
}

impl From<UserEntityError> for UserUseCaseError {
    fn from(err: UserEntityError) -> Self {
        Self::ValidationError(err.get_text().into())
    }
}

/// Erros mapeados para os fluxos de autenticação (Auth Use Cases).
///
/// Para fins de segurança, falhas detalhadas de domínio (ex: senha fora do padrão)
/// ou de repositório (ex: e-mail não encontrado) são propositalmente mascaradas
/// sob a variante `InvalidCredentials` para evitar ataques de enumeração.
#[derive(Debug)]
pub enum AuthServiceError {
    /// Credenciais inválidas. Retornado de forma genérica para proteger dados sensíveis.
    InvalidCredentials,
    /// Falhas severas de infraestrutura (Banco, provedor de Email, Redis, etc).
    InternalError(String),
}

impl Display for AuthServiceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::InvalidCredentials => write!(f, "Invalid Credentials"),
            Self::InternalError(msg) => write!(f, "Internal server error: {}", msg),
        }
    }
}

impl From<RepositoryError> for AuthServiceError {
    fn from(repository_error: RepositoryError) -> Self {
        match repository_error {
            RepositoryError::NotFound => Self::InvalidCredentials,
            RepositoryError::DuplicatedColumn => {
                Self::InternalError("Critical Bug: Duplicated column constraint triggered during an authentication read operation".to_string())
            }
            RepositoryError::Unexpected(error_message) => {
                Self::InternalError(format!("Database error: {}", error_message))
            }
        }
    }
}

impl From<UserEntityError> for AuthServiceError {
    fn from(_: UserEntityError) -> Self {
        Self::InvalidCredentials
    }
}

impl From<PasswordHasherError> for AuthServiceError {
    fn from(password_hasher_error: PasswordHasherError) -> Self {
        match password_hasher_error {
            PasswordHasherError::HashingFailed => {
                Self::InternalError("Cryptographic hashing operation failed".to_string())
            }
        }
    }
}

impl From<OtpStoreError> for AuthServiceError {
    fn from(error: OtpStoreError) -> Self {
        match error {
            OtpStoreError::ConnectionError(msg) => {
                AuthServiceError::InternalError(format!("OTP Store Connection: {}", msg))
            }
            OtpStoreError::StorageError(msg) => {
                AuthServiceError::InternalError(format!("OTP Storage Failure: {}", msg))
            }
        }
    }
}

impl From<EmailSenderError> for AuthServiceError {
    fn from(error: EmailSenderError) -> Self {
        AuthServiceError::InternalError(format!("Email delivery failed: {:?}", error))
    }
}
