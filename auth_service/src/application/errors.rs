use crate::{
    application::ports::{password_hasher::PasswordHasherError, user_repository::RepositoryError},
    domain::errors::UserEntityError,
};

pub enum UserServiceError {
    ValidationError(String),
    Conflict(String),
    NotFound,
    InternalError(String),
}

impl std::fmt::Display for UserServiceError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            UserServiceError::Conflict(error) => write!(f, "Conflict Error: {}", error),
            UserServiceError::InternalError(error) => write!(f, "Internal App Error: {}", error),
            UserServiceError::ValidationError(error) => {
                write!(f, "Invalid Request Format: {}", error)
            }
            UserServiceError::NotFound => write!(f, "Resource not found"),
        }
    }
}

impl From<RepositoryError> for UserServiceError {
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

impl From<UserEntityError> for UserServiceError {
    fn from(err: UserEntityError) -> Self {
        Self::ValidationError(err.get_text())
    }
}

#[derive(Debug)]
pub enum AuthServiceError {
    InvalidCredentials,
    InternalError(String),
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
