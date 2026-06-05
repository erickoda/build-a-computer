use tonic::transport::Channel;

use crate::{
    auth_grpc::{self, auth_client::AuthClient},
    errors::AppError,
};

#[derive(Clone)]
pub struct AuthClientWrapper {
    inner_client: AuthClient<Channel>,
}

impl AuthClientWrapper {
    pub fn new(channel: Channel) -> Self {
        Self {
            inner_client: AuthClient::new(channel),
        }
    }

    pub async fn sign_in(&self, email: &str, password: &str) -> Result<String, AppError> {
        let mut client = self.inner_client.clone();

        let grpc_request = tonic::Request::new(auth_grpc::SignInRequest {
            email: email.to_string(),
            password: password.to_string(),
        });

        let grpc_response = client.sign_in(grpc_request).await?.into_inner();

        Ok(grpc_response.token)
    }

    pub async fn sign_up(&self, email: &str, password: &str, username: &str) -> Result<String, AppError> {
        let mut client = self.inner_client.clone();

        let grpc_request = tonic::Request::new(auth_grpc::SignUpRequest {
            email: email.to_string(),
            password: password.to_string(),
            username: username.to_string()
        });

        let grpc_response = client.sign_up(grpc_request).await?.into_inner();

        Ok(grpc_response.token)
    }
}
