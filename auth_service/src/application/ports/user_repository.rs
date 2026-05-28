use crate::domain::{entities::user::UserEntity, value_objects::email::Email};
use sqlx::types::Uuid;

#[allow(async_fn_in_trait)]
#[cfg_attr(test, mockall::automock)]
pub trait UserRepository: Send + Sync {
    async fn insert_user(&self, user_entity: UserEntity) -> Result<UserEntity, RepositoryError>;
    async fn get_user(&self, id: Uuid) -> Result<UserEntity, RepositoryError>;
    async fn delete_user(&self, id: Uuid) -> Result<(), RepositoryError>;
    async fn get_user_by_email(&self, email: Email) -> Result<UserEntity, RepositoryError>;
    async fn get_users(&self) -> Result<Vec<UserEntity>, RepositoryError>;
}

#[derive(Debug)]
pub enum RepositoryError {
    NotFound,
    DuplicatedColumn,
    Unexpected(String),
}
