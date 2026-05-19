use std::{
    fmt::{self},
    time::{SystemTime, UNIX_EPOCH},
};

use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::domain::{entities::user::UserEntity, value_objects::role::Role};

pub trait TokenGenerator {
    fn generate_token(&self, user_entity: &UserEntity) -> Result<String, TokenError>;
    fn verify_token(&self, token: &str) -> Result<Claims, TokenError>;
}

#[derive(Serialize, Deserialize)]
pub struct Claims {
    sub: Uuid,
    username: String,
    email: String,
    role: Role,
    exp: u64,
    iat: u64,
}

impl Claims {
    pub fn new(user_entity: &UserEntity, expiration_seconds: u64) -> Self {
        let now: u64 = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();

        let exp: u64 = now + expiration_seconds;

        Self {
            sub: user_entity.get_id(),
            username: user_entity.get_username().into(),
            email: user_entity.get_email().into(),
            role: *user_entity.get_role(),
            exp,
            iat: now,
        }
    }

    pub fn get_sub(&self) -> Uuid {
        self.sub
    }

    pub fn get_username(&self) -> &str {
        &self.email
    }

    pub fn get_email(&self) -> &str {
        &self.email
    }

    pub fn get_role(&self) -> Role {
        self.role
    }

    pub fn get_exp(&self) -> u64 {
        self.exp
    }

    pub fn get_iat(&self) -> u64 {
        self.iat
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
