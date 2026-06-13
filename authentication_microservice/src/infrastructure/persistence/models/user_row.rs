use uuid::Uuid;

use crate::{
    application::ports::user_repository::RepositoryError,
    domain::{
        entities::user::UserEntity,
        value_objects::{
            email::Email, hashed_password::HashedPassword, role::Role, status::Status,
            username::Username,
        },
    },
};

#[derive(sqlx::FromRow)]
pub struct UserRow {
    pub id: Uuid,
    pub username: String,
    pub email: String,
    pub password: String,
    pub role: PgRole,
    pub status: PgStatus,
}

#[derive(sqlx::Type, Debug)]
#[sqlx(type_name = "user_status", rename_all = "lowercase")]
pub enum PgStatus {
    Active,
    Inactive,
    Banned,
}

#[derive(sqlx::Type, Debug)]
#[sqlx(type_name = "user_role", rename_all = "lowercase")]
pub enum PgRole {
    Admin,
    Supervisor,
    Common,
}

impl From<&Status> for PgStatus {
    fn from(status: &Status) -> Self {
        match status {
            Status::Active => PgStatus::Active,
            Status::Inactive => PgStatus::Inactive,
            Status::Banned => PgStatus::Banned,
        }
    }
}

impl From<&Role> for PgRole {
    fn from(role: &Role) -> Self {
        match role {
            Role::Admin => PgRole::Admin,
            Role::Supervisor => PgRole::Supervisor,
            Role::Common => PgRole::Common,
        }
    }
}

impl TryInto<UserEntity> for UserRow {
    type Error = RepositoryError;

    fn try_into(self) -> Result<UserEntity, Self::Error> {
        let username = Username::try_from(self.username)
            .map_err(|_| RepositoryError::Unexpected("Invalid username in DB".into()))?;

        let email = Email::try_from(self.email)
            .map_err(|_| RepositoryError::Unexpected("Invalid email in DB".into()))?;

        let password = HashedPassword::from_hash(self.password);

        let role: Role = self.role.into();

        let status: Status = self.status.into();

        Ok(UserEntity::restore(
            self.id, username, email, password, role, status,
        ))
    }
}

impl Into<Status> for PgStatus {
    fn into(self) -> Status {
        match self {
            Self::Active => Status::Active,
            Self::Inactive => Status::Inactive,
            Self::Banned => Status::Banned,
        }
    }
}

impl Into<Role> for PgRole {
    fn into(self) -> Role {
        match self {
            Self::Admin => Role::Admin,
            Self::Supervisor => Role::Supervisor,
            Self::Common => Role::Common,
        }
    }
}
