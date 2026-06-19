use tracing::instrument;
use uuid::Uuid;

use crate::{
    application::{
        commands::{create_user::CreateUserCommand, update_user::UpdateUserCommand},
        errors::UserUseCaseError,
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

/// Responsável pelos fluxos de Gerenciamento de Usuários.
///
/// Lida com as operações de CRUD (Create, Read, Update, Delete) de usuários. 
pub struct UserUseCase<R: UserRepository, P: PasswordHasher> {
    repository: R,
    password_hasher: P,
}

impl<R: UserRepository, P: PasswordHasher> UserUseCase<R, P> {
    /// Instancia o caso de uso injetando as dependências de persistência e criptografia.
    pub fn new(repository: R, password_hasher: P) -> Self {
        Self {
            repository,
            password_hasher,
        }
    }

    /// Cria e persiste um novo usuário no sistema.
    ///
    /// Valida os dados, aplica o hash na senha e delega a inserção ao repositório.
    #[instrument(
        name = "user_use_case_create_user",
        skip(self, command),
        fields(
            username = %command.get_username(),
            email = %command.get_email(),
            role = ?command.get_role(),
        ),
        err
    )]
    pub async fn create_user(
        &self,
        command: CreateUserCommand,
    ) -> Result<UserEntity, UserUseCaseError> {
        let username: Username = Username::try_from(command.get_username().to_string())?;
        let email: Email = Email::try_from(command.get_email().to_string())?;
        let plain_password: PlainPassword =
            PlainPassword::try_from(command.get_password().to_string())?;

        let hashed_password: HashedPassword = self
            .password_hasher
            .hash_password(plain_password)
            .map_err(|_| UserUseCaseError::InternalError("Failed to hash password".into()))?;

        let role: Role = command.get_role();

        let user_entity: UserEntity = UserEntity::new(username, email, hashed_password, role);

        Ok(self.repository.insert_user(user_entity).await?)
    }

    /// Recupera os dados completos de um usuário específico pelo seu UUID.
    #[instrument(name = "user_use_case_get_user", skip(self), err)]
    pub async fn get_user(&self, id: Uuid) -> Result<UserEntity, UserUseCaseError> {
        Ok(self.repository.get_user(id).await?)
    }

    /// Retorna uma lista contendo todos os usuários cadastrados no sistema.
    #[instrument(name = "user_use_case_get_users", skip(self), err)]
    pub async fn get_users(&self) -> Result<Vec<UserEntity>, UserUseCaseError> {
        Ok(self.repository.get_users().await?)
    }

    /// Atualiza as informações de um usuário existente.
    ///
    /// # Autorização
    /// 
    /// Aplica as seguintes regras de negócio antes da atualização:
    /// * Um usuário só pode editar o seu próprio perfil, a menos que seja um `Admin`.
    /// * Modificações sensíveis, como alteração de `Role` (cargo) ou `Status` (atividade), 
    ///   são estritamente restritas a usuários com privilégios de `Admin`.
    #[instrument(
        name = "user_use_case_update_user",
        skip(self, command), 
        fields(
            id = %command.get_id(),
            username = ?command.get_username(),
            email = ?command.get_email(),
            role = ?command.get_role(),
            status = ?command.get_status(),
        ),
        err
    )]
    pub async fn update_user(
        &self,
        command: UpdateUserCommand,
        requester_id: Uuid,
        requester_role: Role,
    ) -> Result<(), UserUseCaseError> {
        if requester_id != command.get_id() && requester_role != Role::Admin {
            return Err(UserUseCaseError::Forbidden);
        }

        let user = self.repository.get_user(command.get_id()).await?;

        let mut username = user.get_username().to_owned();
        let mut email = user.get_email().to_owned();
        let mut password = user.get_password().to_owned();
        let mut role = user.get_role().to_owned();
        let mut status = user.get_status().to_owned();

        if requester_role != Role::Admin {
            if let Some(new_role) = command.get_role().to_owned()
                && role != new_role {
                return Err(UserUseCaseError::Forbidden);
            }

            if let Some(new_status) = command.get_status().to_owned() 
                && status != new_status {
                return Err(UserUseCaseError::Forbidden);
            }
        }

        if let Some(new_username) = command.get_username() {
            username = Username::try_from(new_username.to_owned())?;
        }

        if let Some(new_email) = command.get_email() {
            email = Email::try_from(new_email.to_owned())?;
        }

        if let Some(new_password) = command.get_password() {
            let plain_password: PlainPassword = PlainPassword::try_from(new_password.to_owned())?;

            let hashed_password: HashedPassword = self
                .password_hasher
                .hash_password(plain_password)
                .map_err(|_| UserUseCaseError::InternalError("Failed to hash password".into()))?;

            password = hashed_password;
        }

        if let Some(new_role) = command.get_role() {
            role = new_role.to_owned();
        }

        if let Some(new_status) = command.get_status() {
            status = new_status.to_owned();
        }

        let updated_user =
            UserEntity::restore(command.get_id(), username, email, password, role, status.to_owned());

        self.repository.update_user(updated_user).await?;

        Ok(())
    }

    /// Remove um usuário do banco de dados pelo seu UUID.
    ///
    /// # Autorização
    /// 
    /// Um usuário só tem permissão para deletar a si mesmo. O direito de 
    /// remover contas de terceiros é restrito apenas a requerentes com cargo de `Admin`.
    #[instrument(name = "user_use_case_delete_user", skip(self), err)]
    pub async fn delete_user(
        &self,
        id: Uuid,
        requester_id: Uuid,
        requester_role: Role,
    ) -> Result<(), UserUseCaseError> {
        if requester_id != id && requester_role != Role::Admin {
            return Err(UserUseCaseError::Forbidden);
        }

        Ok(self.repository.delete_user(id).await?)
    }
}
