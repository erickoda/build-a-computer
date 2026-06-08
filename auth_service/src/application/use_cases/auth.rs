use rand::RngExt;

use crate::{
    application::{
        commands::{
            forgot_password::ForgotPasswordCommand, sign_in::SignInCommand, sign_up::SignUpCommand,
        },
        errors::AuthServiceError,
        outputs::auth::AuthOutput,
        ports::{
            email_sender::EmailSender, otp_store::OtpStore, password_hasher::PasswordHasher,
            token_generator::TokenGenerator, user_repository::UserRepository,
        },
    },
    auth_grpc::ResetPasswordRequest,
    domain::{
        entities::user::UserEntity,
        value_objects::{
            email::Email, hashed_password::HashedPassword, plain_password::PlainPassword,
            role::Role, username::Username,
        },
    },
};

pub struct AuthUseCase<
    R: UserRepository,
    T: TokenGenerator,
    P: PasswordHasher,
    E: EmailSender,
    O: OtpStore,
> {
    repository: R,
    token_generator: T,
    password_hasher: P,
    email_sender: E,
    otp_store: O,
}

impl<R: UserRepository, T: TokenGenerator, P: PasswordHasher, E: EmailSender, O: OtpStore>
    AuthUseCase<R, T, P, E, O>
{
    pub fn new(
        repository: R,
        token_generator: T,
        password_hasher: P,
        email_sender: E,
        otp_store: O,
    ) -> Self {
        Self {
            repository,
            token_generator,
            password_hasher,
            email_sender,
            otp_store,
        }
    }

    pub async fn sign_in(&self, command: SignInCommand) -> Result<AuthOutput, AuthServiceError> {
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

    pub async fn sign_up(&self, command: SignUpCommand) -> Result<AuthOutput, AuthServiceError> {
        let username: Username = Username::try_from(command.get_username().to_string())?;
        let email: Email = Email::try_from(command.get_email().to_string())?;
        let plain_password: PlainPassword =
            PlainPassword::try_from(command.get_password().to_string())?;

        let hashed_password: HashedPassword = self
            .password_hasher
            .hash_password(plain_password)
            .map_err(|_| AuthServiceError::InternalError("Failed to hash password".into()))?;

        let new_user_entity: UserEntity =
            UserEntity::new(username, email, hashed_password, Role::Common);

        let created_entity: UserEntity = self.repository.insert_user(new_user_entity).await?;

        let token: String = self
            .token_generator
            .generate_token(&created_entity)
            .map_err(|_| AuthServiceError::InternalError("Failed to generate token".to_string()))?;

        Ok(AuthOutput::new(token))
    }

    pub async fn forgot_password(
        &self,
        command: ForgotPasswordCommand,
    ) -> Result<(), AuthServiceError> {
        let email: Email = Email::try_from(command.get_email().to_string())?;

        let _ = self.repository.get_user_by_email(email.clone()).await?;

        let otp: String = rand::rng()
            .sample_iter(&rand::distr::Alphanumeric)
            .take(6)
            .map(char::from)
            .collect::<String>()
            .to_uppercase();

        self.otp_store.store_otp(&email, &otp).await?;

        self.email_sender.send_otp(&email, &otp).await?;

        Ok(())
    }

    pub async fn reset_password(
        &self,
        command: ResetPasswordRequest,
    ) -> Result<(), AuthServiceError> {
        let email: Email = Email::try_from(command.email.clone())?;

        let stored_otp =
            self.otp_store.get_otp(&email).await?.ok_or_else(|| {
                AuthServiceError::InternalError("OTP not found or expired".into())
            })?;

        if stored_otp != command.otp {
            println!("Aqui1");
            return Err(AuthServiceError::InvalidCredentials);
        }

        let plain_password = PlainPassword::try_from(command.new_password)?;
        let hashed_password: HashedPassword = self
            .password_hasher
            .hash_password(plain_password)
            .map_err(|_| AuthServiceError::InternalError("Failed to hash password".into()))?;

        let _: UserEntity = self.repository.get_user_by_email(email.clone()).await?;

        self.repository
            .change_password_by_email(&hashed_password, &email)
            .await?;

        self.otp_store.delete_otp(&email).await?;

        Ok(())
    }
}

#[cfg(test)]
mod test {
    use mockall::predicate::*;

    use uuid::Uuid;

    use crate::{
        application::ports::{
            email_sender::MockEmailSender,
            otp_store::MockOtpStore,
            password_hasher::MockPasswordHasher,
            token_generator::MockTokenGenerator,
            user_repository::{MockUserRepository, RepositoryError},
        },
        domain::value_objects::{
            hashed_password::HashedPassword, role::Role, status::Status, username::Username,
        },
    };

    use super::*;

    fn create_dummy_user() -> UserEntity {
        UserEntity::restore(
            Uuid::new_v4(),
            Username::try_from("usuario_teste".to_string()).unwrap(),
            Email::try_from("user@email.com".to_string()).unwrap(),
            HashedPassword::from_hash("hashed_password".to_string()),
            Role::Common,
            Status::Active,
        )
    }

    #[tokio::test]
    async fn test_should_authenticate_successfully() {
        let mut mock_repository = MockUserRepository::new();
        let mut mock_password_hasher = MockPasswordHasher::new();
        let mut mock_token_generator = MockTokenGenerator::new();
        let mock_email_sender = MockEmailSender::new();
        let mock_otp_store = MockOtpStore::new();

        let dummy_user = create_dummy_user();
        let expected_token = "jwt_token_valido_123".to_string();

        mock_repository
            .expect_get_user_by_email()
            .with(eq(Email::try_from("user@email.com".to_string()).unwrap()))
            .times(1)
            .returning({
                let user = dummy_user.clone();
                move |_| Ok(user.clone())
            });

        mock_password_hasher
            .expect_verify_password()
            .with(eq("hashed_password"), eq("senha_correta_123"))
            .times(1)
            .returning(|_, _| Ok(true));

        mock_token_generator
            .expect_generate_token()
            .times(1)
            .returning({
                let token = expected_token.clone();
                move |_| Ok(token.clone())
            });

        let auth_service = AuthUseCase::new(
            mock_repository,
            mock_token_generator,
            mock_password_hasher,
            mock_email_sender,
            mock_otp_store,
        );

        let command = SignInCommand::new("user@email.com".into(), "senha_correta_123".into());

        let result = auth_service.sign_in(command).await;

        assert!(result.is_ok());
        assert_eq!(result.unwrap().get_token(), expected_token);
    }

    #[tokio::test]
    async fn test_should_return_invalid_credentials_when_password_is_wrong() {
        let mut mock_repository = MockUserRepository::new();
        let mut mock_password_hasher = MockPasswordHasher::new();
        let mock_token_generator = MockTokenGenerator::new();
        let mock_email_sender = MockEmailSender::new();
        let mock_otp_store = MockOtpStore::new();

        let dummy_user = create_dummy_user();

        mock_repository
            .expect_get_user_by_email()
            .with(eq(Email::try_from("user@email.com".to_string()).unwrap()))
            .times(1)
            .returning({
                let user = dummy_user.clone();
                move |_| Ok(user.clone())
            });

        mock_password_hasher
            .expect_verify_password()
            .with(eq("hashed_password"), eq("wrong_password"))
            .times(1)
            .returning(|_, _| Ok(false));

        let command = SignInCommand::new("user@email.com".into(), "wrong_password".into());

        let auth_service = AuthUseCase::new(
            mock_repository,
            mock_token_generator,
            mock_password_hasher,
            mock_email_sender,
            mock_otp_store,
        );

        let result = auth_service.sign_in(command).await;

        assert!(result.is_err());
        assert!(matches!(
            result.unwrap_err(),
            AuthServiceError::InvalidCredentials
        ));
    }

    #[tokio::test]
    async fn test_should_return_invalid_credentials_when_user_not_found() {
        let mut mock_repository = MockUserRepository::new();
        let mock_password_hasher = MockPasswordHasher::new();
        let mock_token_generator = MockTokenGenerator::new();
        let mock_email_sender = MockEmailSender::new();
        let mock_otp_store = MockOtpStore::new();

        mock_repository
            .expect_get_user_by_email()
            .with(eq(
                Email::try_from("user_not_found@email.com".to_string()).unwrap()
            ))
            .times(1)
            .returning(|_| Err(RepositoryError::NotFound));

        let command = SignInCommand::new("user_not_found@email.com".into(), "any_password".into());

        let auth_service = AuthUseCase::new(
            mock_repository,
            mock_token_generator,
            mock_password_hasher,
            mock_email_sender,
            mock_otp_store,
        );

        let result = auth_service.sign_in(command).await;

        assert!(result.is_err());
        assert!(matches!(
            result.unwrap_err(),
            AuthServiceError::InvalidCredentials
        ));
    }
}
