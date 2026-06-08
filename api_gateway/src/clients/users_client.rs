use tonic::transport::Channel;

use crate::{
    clients::metadata::with_auth_metadata,
    errors::AppError,
    security::token::AuthenticatedUser,
    users_grpc::{self, users_client::UsersClient},
};

#[derive(Clone)]
pub struct UsersClientWrapper {
    inner_client: UsersClient<Channel>,
}

impl UsersClientWrapper {
    pub fn new(channel: Channel) -> Self {
        Self {
            inner_client: UsersClient::new(channel),
        }
    }

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

    pub async fn get_users(
        &self,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<users_grpc::ListOfUsers, AppError> {
        let grpc_payload = users_grpc::Empty {};

        let grpc_request = with_auth_metadata(grpc_payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.get_users(grpc_request).await?.into_inner())
    }

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
