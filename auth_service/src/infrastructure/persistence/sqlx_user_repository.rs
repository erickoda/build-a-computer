use sqlx::PgPool;
use uuid::Uuid;

use crate::{
    application::ports::user_repository::{RepositoryError, UserRepository},
    domain::entities::user::UserEntity,
    infrastructure::persistence::models::user_row::{PgRole, PgStatus, UserRow},
};

#[derive(Clone)]
pub struct SqlxUserRepository {
    pool: PgPool,
}

impl SqlxUserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

impl UserRepository for SqlxUserRepository {
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

    async fn get_user(&self, id: Uuid) -> Result<UserEntity, RepositoryError> {
        let row: UserRow = sqlx::query_as!(
            UserRow,
            r#"
            SELECT id, username, email, password, role AS "role: PgRole", status AS "status: PgStatus"
            FROM users
            WHERE id = $1
            "#,
            id
        )
        .fetch_one(&self.pool)
        .await?;

        let entity = row.try_into()?;

        Ok(entity)
    }

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
            WHERE email = $1
            "#,
            email_string
        )
        .fetch_one(&self.pool)
        .await?;

        let user_entity: UserEntity = result.try_into()?;
        Ok(user_entity)
    }

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
            "#,
        )
        .fetch_all(&self.pool)
        .await?;

        rows.into_iter()
            .map(|row| row.try_into())
            .collect::<Result<Vec<UserEntity>, _>>()
    }
}

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
