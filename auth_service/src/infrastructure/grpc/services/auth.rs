use tonic::{Request, Response, Status};

use crate::{
    application::{commands::auth::AuthCommand, outputs::auth::AuthOutput},
    auth_grpc::{AuthReply, AuthRequest, auth_server::Auth},
    infrastructure::AppAuthUseCase,
};

pub struct AuthService {
    auth_use_case: AppAuthUseCase,
}

impl AuthService {
    pub fn new(auth_use_case: AppAuthUseCase) -> Self {
        Self { auth_use_case }
    }
}

#[tonic::async_trait]
impl Auth for AuthService {
    async fn authenticate_user(
        &self,
        request: Request<AuthRequest>,
    ) -> Result<Response<AuthReply>, Status> {
        let auth = request.into_inner();

        Ok(Response::from(AuthReply::from(
            self.auth_use_case.authenticate(auth.into()).await?,
        )))
    }
}

impl Into<AuthCommand> for AuthRequest {
    fn into(self) -> AuthCommand {
        AuthCommand::new(self.email, self.password)
    }
}

impl From<AuthOutput> for AuthReply {
    fn from(auth_output: AuthOutput) -> Self {
        Self {
            token: auth_output.get_token().into(),
        }
    }
}
