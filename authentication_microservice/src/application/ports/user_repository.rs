use std::fmt::Display;

use crate::domain::{
    entities::user::UserEntity,
    value_objects::{email::Email, hashed_password::HashedPassword},
};
use sqlx::types::Uuid;

/// Porta (Trait) para o repositório de dados de Usuários.
#[allow(async_fn_in_trait)]
#[cfg_attr(test, mockall::automock)]
pub trait UserRepository: Send + Sync {
    /// Persiste um novo usuário no banco de dados.
    async fn insert_user(&self, user_entity: UserEntity) -> Result<UserEntity, RepositoryError>;

    /// Busca um usuário específico pelo seu identificador único (UUID).
    async fn get_user(&self, id: Uuid) -> Result<UserEntity, RepositoryError>;

    /// Remove um usuário do sistema (física ou logicamente) pelo seu identificador.
    async fn delete_user(&self, id: Uuid) -> Result<(), RepositoryError>;

    /// Busca um usuário utilizando o seu endereço de e-mail.
    async fn get_user_by_email(&self, email: Email) -> Result<UserEntity, RepositoryError>;

    /// Retorna uma lista com os usuários do sistema.
    async fn get_users(&self) -> Result<Vec<UserEntity>, RepositoryError>;

    /// Atualiza os dados de um usuário já existente.
    async fn update_user(&self, user: UserEntity) -> Result<(), RepositoryError>;

    /// Atualiza exclusivamente a senha de um usuário, buscando-o pelo e-mail.
    async fn change_password_by_email(
        &self,
        password: &HashedPassword,
        email: &Email,
    ) -> Result<(), RepositoryError>;
}

/// Representa os erros traduzidos da camada de infraestrutura (banco de dados).
#[derive(Debug)]
pub enum RepositoryError {
    /// O registro buscado não existe no banco de dados.
    NotFound,

    /// Violação de restrição de unicidade.
    DuplicatedColumn,

    /// Falha interna do banco de dados.
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
