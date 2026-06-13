use std::fmt::{self};
use uuid::Uuid;

use crate::domain::{entities::user::UserEntity, value_objects::role::Role};

#[cfg_attr(test, mockall::automock)]
pub trait TokenGenerator {
    fn generate_token(&self, user_entity: &UserEntity) -> Result<String, TokenError>;
    fn verify_token(&self, token: &str) -> Result<TokenPayload, TokenError>;
}

#[derive(Debug, Clone)]
pub struct TokenPayload {
    id: Uuid,
    username: String,
    email: String,
    role: Role,
}

impl TokenPayload {
    pub fn new(id: Uuid, username: String, email: String, role: Role) -> Self {
        Self {
            id,
            username,
            email,
            role,
        }
    }

    pub fn get_id(&self) -> Uuid {
        self.id
    }

    pub fn get_username(&self) -> &str {
        &self.username
    }

    pub fn get_email(&self) -> &str {
        &self.email
    }

    pub fn get_role(&self) -> Role {
        self.role
    }
}

pub enum TokenError {
    GenerationFailed,
    Expired,
    InvalidToken,
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
