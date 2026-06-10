use std::fmt::Display;

use crate::domain::{
    entities::user::UserEntity,
    value_objects::{email::Email, hashed_password::HashedPassword},
};
use sqlx::types::Uuid;

#[allow(async_fn_in_trait)]
#[cfg_attr(test, mockall::automock)]
pub trait UserRepository: Send + Sync {
    async fn insert_user(&self, user_entity: UserEntity) -> Result<UserEntity, RepositoryError>;
    async fn get_user(&self, id: Uuid) -> Result<UserEntity, RepositoryError>;
    async fn delete_user(&self, id: Uuid) -> Result<(), RepositoryError>;
    async fn get_user_by_email(&self, email: Email) -> Result<UserEntity, RepositoryError>;
    async fn get_users(&self) -> Result<Vec<UserEntity>, RepositoryError>;
    async fn update_user(&self, user: UserEntity) -> Result<(), RepositoryError>;
    async fn change_password_by_email(
        &self,
        password: &HashedPassword,
        email: &Email,
    ) -> Result<(), RepositoryError>;
}

#[derive(Debug)]
pub enum RepositoryError {
    NotFound,
    DuplicatedColumn,
    Unexpected(String),
}

impl Display for RepositoryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NotFound => write!(f, "User not found"),
            Self::DuplicatedColumn => write!(f, "Email already exists"),
            Self::Unexpected(msg) => write!(f, "Unexpected repository error: {}", msg),
        }
    }
}
