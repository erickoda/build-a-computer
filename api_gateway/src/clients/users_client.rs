use tonic::transport::Channel;

use crate::{
    clients::metadata::with_auth_metadata,
    errors::AppError,
    security::token::AuthenticatedUser,
    users_grpc::{self, users_client::UsersClient},
};

/// Wrapper para o cliente gRPC de usuários.
///
/// Mantém o canal de comunicação persistente com o microsserviço e expõe
/// métodos que exigem que o usuários estejam autenticados através do
/// `AuthenticatedUser`.
#[derive(Clone)]
pub struct UsersClientWrapper {
    inner_client: UsersClient<Channel>,
}

impl UsersClientWrapper {
    /// Inicializa um novo wrapper utilizando um `Channel` existente.
    pub fn new(channel: Channel) -> Self {
        Self {
            inner_client: UsersClient::new(channel),
        }
    }

    /// Envia a requisição de criação de um novo usuário para o microsserviço.
    ///
    /// # Erros
    ///
    /// Retorna [`AppError`] caso a injeção de metadados falhe ou o microsserviço
    /// retorne um erro gRPC (ex: e-mail já cadastrado, erro interno, etc).
    pub async fn create_user(
        &self,
        username: String,
        email: String,
        password: String,
        role: users_grpc::Role,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<users_grpc::User, AppError> {
        let grpc_payload = users_grpc::CreateUserRequest {
            username,
            email,
            password,
            role: role.into(),
        };

        let grpc_request = with_auth_metadata(grpc_payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.create_user(grpc_request).await?.into_inner())
    }

    /// Busca as informações de um usuário específico pelo seu ID.
    pub async fn get_user(
        &self,
        id: String,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<users_grpc::User, AppError> {
        let grpc_payload = users_grpc::UserId { id };

        let grpc_request = with_auth_metadata(grpc_payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.get_user(grpc_request).await?.into_inner())
    }

    /// Busca a lista completa de usuários cadastrados no microsserviço.
    pub async fn get_users(
        &self,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<users_grpc::ListOfUsers, AppError> {
        let grpc_payload = users_grpc::Empty {};

        let grpc_request = with_auth_metadata(grpc_payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.get_users(grpc_request).await?.into_inner())
    }

    /// Solicita a remoção de um usuário do sistema com base no seu ID.
    pub async fn delete_user(
        &self,
        id: String,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<users_grpc::Empty, AppError> {
        let grpc_payload = users_grpc::UserId { id };

        let grpc_request = with_auth_metadata(grpc_payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.delete_user(grpc_request).await?.into_inner())
    }

    /// Envia uma solicitação para atualizar os dados de um usuário existente.
    ///
    /// Campos passados como `None` serão ignorados pelo microsserviço e
    /// permanecerão inalterados no banco de dados.
    pub async fn update_user(
        &self,
        id: String,
        username: Option<String>,
        email: Option<String>,
        password: Option<String>,
        role: Option<users_grpc::Role>,
        status: Option<users_grpc::Status>,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<users_grpc::Empty, AppError> {
        let grpc_payload = users_grpc::UpdateUserRequest {
            id,
            username,
            email,
            password,
            role: role.map(Into::into),
            status: status.map(Into::into),
        };

        let grpc_request = with_auth_metadata(grpc_payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.update_user(grpc_request).await?.into_inner())
    }
}
