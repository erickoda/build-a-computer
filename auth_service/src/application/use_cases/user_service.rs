use uuid::Uuid;

use crate::{
    application::{
        commands::create_user::CreateUserCommand,
        errors::UserServiceError,
        ports::{password_hasher::PasswordHasher, user_repository::UserRepository},
    },
    domain::{
        entities::user::UserEntity,
        value_objects::{
            email::Email, hashed_password::HashedPassword, plain_password::PlainPassword,
            role::Role, username::Username,
        },
    },
};

pub struct UserService<R: UserRepository, P: PasswordHasher> {
    repository: R,
    password_hasher: P,
}

impl<R: UserRepository, P: PasswordHasher> UserService<R, P> {
    pub fn new(repository: R, password_hasher: P) -> Self {
        Self {
            repository,
            password_hasher,
        }
    }

    pub async fn create_user(
        &self,
        command: CreateUserCommand,
    ) -> Result<UserEntity, UserServiceError> {
        let username: Username = Username::try_from(command.get_username().to_string())?;
        let email: Email = Email::try_from(command.get_email().to_string())?;
        let plain_password: PlainPassword =
            PlainPassword::try_from(command.get_password().to_string())?;

        let hashed_password: HashedPassword = self
            .password_hasher
            .hash_password(plain_password)
            .map_err(|_| UserServiceError::InternalError("Failed to hash password".into()))?;

        let role: Role = command.get_role();

        let user_entity: UserEntity = UserEntity::new(username, email, hashed_password, role);

        Ok(self.repository.insert_user(user_entity).await?)
    }

    pub async fn get_user(&self, id: Uuid) -> Result<UserEntity, UserServiceError> {
        Ok(self.repository.get_user(id).await?)
    }

    pub async fn get_users(&self) -> Result<Vec<UserEntity>, UserServiceError> {
        Ok(self.repository.get_users().await?)
    }

    pub async fn delete_user(
        &self,
        id: Uuid,
        requester_id: Uuid,
        requester_role: Role,
    ) -> Result<(), UserServiceError> {
        if requester_id != id && requester_role != Role::Admin {
            return Err(UserServiceError::Forbidden);
        }

        Ok(self.repository.delete_user(id).await?)
    }
}
