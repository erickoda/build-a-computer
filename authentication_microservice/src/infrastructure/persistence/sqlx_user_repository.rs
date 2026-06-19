use sqlx::PgPool;
use tracing::instrument;
use uuid::Uuid;

use crate::{
    application::ports::user_repository::{RepositoryError, UserRepository},
    domain::{
        entities::user::UserEntity,
        value_objects::{email::Email, hashed_password::HashedPassword},
    },
    infrastructure::persistence::models::user_row::{PgRole, PgStatus, UserRow},
};

/// Implementação do Repositório de Usuários (Adapter - [`UserRepository`]) utilizando PostgreSQL.
///
/// Gerencia a comunicação com o banco de dados de forma assíncrona utilizando [`sqlx`]. 
/// Todas as queries são checadas em tempo de compilação (compile-time checked) 
/// pelas macros do [`sqlx`], garantindo que o SQL seja sempre válido em relação 
/// ao schema atual do banco.
#[derive(Clone)]
pub struct SqlxUserRepository {
    pool: PgPool,
}

impl SqlxUserRepository {
    /// Instancia um novo repositório recebendo um Pool de conexões do PostgreSQL.
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

impl UserRepository for SqlxUserRepository {
    /// Insere um novo registro de usuário no banco de dados.
    #[instrument(
        name = "db_user_insert",
        skip(self, user), 
        fields(
            id = %user.get_id().to_string(),
            username = %String::from(user.get_username()),
            email = %String::from(user.get_email()),
            role = ?user.get_role(),
            status = ?user.get_status()
        ),
        err
    )]
    async fn insert_user(&self, user: UserEntity) -> Result<UserEntity, RepositoryError> {
        let uuid: Uuid = user.get_id();
        let username: String = user.get_username().into();
        let email: String = user.get_email().into();
        let password: String = user.get_password().as_str().to_string();
        let role: PgRole = user.get_role().into();
        let status: PgStatus = user.get_status().into();

        match sqlx::query_as!(
            UserRow,
            r#"
        INSERT INTO users (id, username, email, password, role, status)
        VALUES ($1, $2, $3, $4, $5::user_role, $6::user_status)
        "#,
            uuid,
            username,
            email,
            password,
            role as PgRole,
            status as PgStatus
        )
        .execute(&self.pool)
        .await
        {
            Ok(_) => Ok(user),
            Err(sqlx_error) => Err(sqlx_error.into()),
        }
    }

    /// Busca um usuário pelo seu UUID. 
    /// Retorna sucesso apenas se o status do usuário for [`PgStatus::Active`].
    #[instrument(
        name = "db_get_user_by_id",
        skip(self), 
        err
    )]
    async fn get_user(&self, id: Uuid) -> Result<UserEntity, RepositoryError> {
        let row: UserRow = sqlx::query_as!(
            UserRow,
            r#"
            SELECT id, username, email, password, role AS "role: PgRole", status AS "status: PgStatus"
            FROM users
            WHERE id = $1 and status = $2::user_status
            "#,
            id,
            PgStatus::Active as _,
        )
        .fetch_one(&self.pool)
        .await?;

        let entity = row.try_into()?;

        Ok(entity)
    }

    /// Executa um soft delete do usuário no banco de dados.
    #[instrument(
        name = "db_delete_user_by_id",
        skip(self), 
        err
    )]
    async fn delete_user(&self, id: Uuid) -> Result<(), RepositoryError> {
        let result = sqlx::query!(
            r#"
            UPDATE users
            SET status = $1::user_status
            WHERE id = $2
            "#,
            PgStatus::Inactive as _,
            id
        )
        .execute(&self.pool)
        .await?;

        if result.rows_affected() == 0 {
            return Err(RepositoryError::NotFound);
        }

        Ok(())
    }

    /// Busca um usuário através do seu e-mail. 
    /// Retorna apenas usuários com status [`PgStatus::Active`].
    #[instrument(
        name = "db_get_user_by_email",
        skip(self), 
        fields(email = % String::from(&email)),
        err
    )]
    async fn get_user_by_email(
        &self,
        email: crate::domain::value_objects::email::Email,
    ) -> Result<UserEntity, RepositoryError> {
        let email_string: String = (&email).into();
        let result: UserRow = sqlx::query_as!(
            UserRow,
            r#"
            SELECT 
                id, 
                username, 
                email, 
                password, 
                role AS "role: PgRole", 
                status AS "status: PgStatus"
            FROM users
            WHERE email = $1 and status = $2::user_status
            "#,
            email_string,
            PgStatus::Active as _,
        )
        .fetch_one(&self.pool)
        .await?;

        let user_entity: UserEntity = result.try_into()?;
        Ok(user_entity)
    }

    /// Retorna uma lista com todos os usuários do sistema que estão com o status [`PgStatus::Active`].
    #[instrument(
        name = "db_get_all_users",
        skip(self), 
        err
    )]
    async fn get_users(&self) -> Result<Vec<UserEntity>, RepositoryError> {
        let rows: Vec<UserRow> = sqlx::query_as!(
            UserRow,
            r#"
            SELECT 
                id, 
                username, 
                email, 
                password, 
                role AS "role: PgRole", 
                status AS "status: PgStatus"
            FROM users
            WHERE status = $1::user_status
            "#,
            PgStatus::Active as _,
        )
        .fetch_all(&self.pool)
        .await?;

        rows.into_iter()
            .map(|row| row.try_into())
            .collect::<Result<Vec<UserEntity>, _>>()
    }

    /// Sobrescreve as informações de um usuário existente.
    #[instrument(
        name = "db_update_user",
        skip(self, user), 
        fields(
            id = %user.get_id().to_string(),
            username = %String::from(user.get_username()),
            email = %String::from(user.get_email()),
            role = ?user.get_role(),
            status = ?user.get_status()
        ),
        err
    )]
    async fn update_user(&self, user: UserEntity) -> Result<(), RepositoryError> {
        let uuid: Uuid = user.get_id();
        let username: String = user.get_username().into();
        let email: String = user.get_email().into();
        let password: String = user.get_password().as_str().to_string();
        let role: PgRole = user.get_role().into();
        let status: PgStatus = user.get_status().into();

        let result = sqlx::query_as!(
            UserRow,
            r#"
            UPDATE users
            SET
                username = $1,
                email = $2,
                password = $3,
                role = $4,
                status = $5
            WHERE id = $6
            "#,
            username,
            email,
            password,
            role as _,
            status as _,
            uuid
        )
        .execute(&self.pool)
        .await?;

        if result.rows_affected() == 0 {
            return Err(RepositoryError::NotFound);
        }

        Ok(())
    }

    /// Atualiza exclusivamente a coluna de senha buscando o usuário pelo e-mail ativo.
    #[instrument(
        name = "db_update_user",
        skip(self, password), 
        err
    )]
    async fn change_password_by_email(
        &self,
        password: &HashedPassword,
        email: &Email,
    ) -> Result<(), RepositoryError> {
        let password: &str = password.as_str();
        let email: String = email.into();

        let result = sqlx::query_as!(
            UserRow,
            r#"
            UPDATE users
            SET password = $1
            WHERE email = $2 and status = $3::user_status
            "#,
            password,
            email,
            PgStatus::Active as _
        )
        .execute(&self.pool)
        .await?;

        if result.rows_affected() == 0 {
            return Err(RepositoryError::NotFound);
        }

        Ok(())
    }
}

/// Traduz falhas diretas do Driver SQL para erros mapeados do Repositório.
impl From<sqlx::Error> for RepositoryError {
    fn from(value: sqlx::Error) -> Self {
        match value {
            sqlx::Error::RowNotFound => RepositoryError::NotFound,
            sqlx::Error::Database(e) if e.is_unique_violation() => {
                RepositoryError::DuplicatedColumn
            }
            e => RepositoryError::Unexpected(e.to_string()),
        }
    }
}
