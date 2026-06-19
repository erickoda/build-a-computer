use std::fmt::{self};
use uuid::Uuid;

use crate::domain::{entities::user::UserEntity, value_objects::role::Role};

/// Porta (Trait) para o serviço de geração e verificação de tokens de autenticação.
#[cfg_attr(test, mockall::automock)]
pub trait TokenGenerator: Send + Sync {
    /// Gera um novo token contendo os dados essenciais do usuário.
    fn generate_token(&self, user_entity: &UserEntity) -> Result<String, TokenError>;

    /// Verifica a assinatura e a validade de um token, retornando seu conteúdo (Payload).
    fn verify_token(&self, token: &str) -> Result<TokenPayload, TokenError>;
}

/// Representa os dados extraídos de um token decodificado e validado.
#[derive(Debug, Clone)]
pub struct TokenPayload {
    id: Uuid,
    username: String,
    email: String,
    role: Role,
}

impl TokenPayload {
    /// Instancia um novo payload.
    pub fn new(id: Uuid, username: String, email: String, role: Role) -> Self {
        Self {
            id,
            username,
            email,
            role,
        }
    }

    /// Retorna o identificador único do usuário (UUID).
    pub fn get_id(&self) -> Uuid {
        self.id
    }

    /// Retorna uma referência ao nome do usuário.
    pub fn get_username(&self) -> &str {
        &self.username
    }

    /// Retorna uma referência ao e-mail do usuário.
    pub fn get_email(&self) -> &str {
        &self.email
    }

    /// Retorna o cargo (nível de acesso) do usuário.
    pub fn get_role(&self) -> Role {
        self.role
    }
}

/// Representa as falhas que podem ocorrer na geração ou validação de um token.
pub enum TokenError {
    /// Ocorreu uma falha no algoritmo ao tentar gerar e assinar o token.
    GenerationFailed,
    /// O token foi validado, mas seu TTL já expirou.
    Expired,
    /// O token possui formato inválido, assinatura corrompida ou foi adulterado.
    InvalidToken,
    /// Erro interno não previsto na infraestrutura de tokens.
    InternalError(String),
}

impl fmt::Display for TokenError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TokenError::Expired => write!(f, "The authentication token has expired"),
            TokenError::GenerationFailed => write!(f, "Failed to generate authentication token"),
            TokenError::InvalidToken => {
                write!(f, "The authentication token is invalid or corrupted")
            }
            TokenError::InternalError(error) => write!(f, "Internal Token Error: {}", error),
        }
    }
}
