use tonic::{Request, Response, Status};

use crate::{
    application::{
        commands::{sign_in::SignInCommand, sign_up::SignUpCommand},
        outputs::auth::AuthOutput,
    },
    auth_grpc::{
        AuthReply, Empty, ForgotPasswordRequest, ResetPasswordRequest, SignInRequest,
        SignUpRequest, auth_server::Auth,
    },
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
    async fn sign_in(
        &self,
        request: Request<SignInRequest>,
    ) -> Result<Response<AuthReply>, Status> {
        let auth = request.into_inner();

        Ok(Response::from(AuthReply::from(
            self.auth_use_case.sign_in(auth.into()).await?,
        )))
    }

    async fn sign_up(
        &self,
        request: Request<SignUpRequest>,
    ) -> Result<Response<AuthReply>, Status> {
        Ok(Response::from(AuthReply::from(
            self.auth_use_case
                .sign_up(request.into_inner().into())
                .await?,
        )))
    }

    async fn forgot_password(
        &self,
        request: Request<ForgotPasswordRequest>,
    ) -> Result<Response<Empty>, Status> {
        self.auth_use_case
            .forgot_password(request.into_inner().into())
            .await?;

        Ok(Response::from(Empty {}))
    }

    async fn reset_password(
        &self,
        request: Request<ResetPasswordRequest>,
    ) -> Result<Response<Empty>, Status> {
        self.auth_use_case
            .reset_password(request.into_inner().into())
            .await?;

        Ok(Response::from(Empty {}))
    }
}

impl Into<SignInCommand> for SignInRequest {
    fn into(self) -> SignInCommand {
        SignInCommand::new(self.email, self.password)
    }
}

impl Into<SignUpCommand> for SignUpRequest {
    fn into(self) -> SignUpCommand {
        SignUpCommand::new(self.username, self.email, self.password)
    }
}

impl From<AuthOutput> for AuthReply {
    fn from(auth_output: AuthOutput) -> Self {
        Self {
            token: auth_output.get_token().into(),
        }
    }
}
