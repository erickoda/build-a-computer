use crate::{
    application::{
        commands::auth::AuthCommand,
        errors::AuthServiceError,
        outputs::auth::AuthOutput,
        ports::{
            password_hasher::PasswordHasher, token_generator::TokenGenerator,
            user_repository::UserRepository,
        },
    },
    domain::{entities::user::UserEntity, value_objects::email::Email},
};

pub struct AuthService<R: UserRepository, T: TokenGenerator, P: PasswordHasher> {
    repository: R,
    token_generator: T,
    password_hasher: P,
}

impl<R: UserRepository, T: TokenGenerator, P: PasswordHasher> AuthService<R, T, P> {
    pub fn new(repository: R, token_generator: T, password_hasher: P) -> Self {
        Self {
            repository,
            token_generator,
            password_hasher,
        }
    }

    pub async fn authenticate(&self, command: AuthCommand) -> Result<AuthOutput, AuthServiceError> {
        let email: Email = Email::try_from(command.get_email().to_string())?;
        let password: String = command.get_password().to_string();

        let user_entity: UserEntity = self.repository.get_user_by_email(email).await?;

        if !self
            .password_hasher
            .verify_password(user_entity.get_password().as_str(), &password)?
        {
            return Err(AuthServiceError::InvalidCredentials);
        }

        let token: String = self
            .token_generator
            .generate_token(&user_entity)
            .map_err(|_| {
                AuthServiceError::InternalError("Failed to generate jwt token".to_string())
            })?;

        Ok(AuthOutput::new(token))
    }
}
