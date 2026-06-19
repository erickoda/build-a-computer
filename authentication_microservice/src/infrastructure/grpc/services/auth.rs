use tonic::{Request, Response, Status};

use crate::{
    auth_grpc::{
        AuthReply, Empty, ForgotPasswordRequest, ResetPasswordRequest, SignInRequest,
        SignUpRequest, auth_server,
    },
    infrastructure::AppAuthUseCase,
};

/// Handler para os endpoints gRPC de Autenticação.
///
/// Atua como um Adaptador Primário (Primary/Driving Adapter). Ele recebe as
/// requisições da rede via [`tonic`], converte os payloads gRPC para os Comandos
/// da camada de Aplicação e repassa a execução para o Caso de Uso.
pub struct AuthService {
    auth_use_case: AppAuthUseCase,
}

impl AuthService {
    /// Instancia o serviço gRPC injetando o Caso de Uso de Autenticação.
    pub fn new(auth_use_case: AppAuthUseCase) -> Self {
        Self { auth_use_case }
    }
}

#[tonic::async_trait]
impl auth_server::Auth for AuthService {
    /// Endpoint de Login.
    ///
    /// Recebe e-mail e senha, delega a validação ao Caso de Uso e, em caso de
    /// sucesso, retorna o JWT envelopado na estrutura gRPC [`AuthReply`].
    async fn sign_in(
        &self,
        request: Request<SignInRequest>,
    ) -> Result<Response<AuthReply>, Status> {
        let auth = request.into_inner();

        Ok(Response::from(AuthReply::from(
            self.auth_use_case.sign_in(auth.into()).await?,
        )))
    }

    /// Endpoint de Cadastro de Usuário.
    ///
    /// Recebe os dados de um novo usuário ([`SignUpRequest`]), repassa para a criação e retorna
    /// automaticamente um token de sessão válido no formato gRPC ([`AuthReply`]), em caso de sucesso.
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

    /// Endpoint para solicitar a recuperação de senha.
    ///
    /// Inicia o fluxo que envia o código OTP para o e-mail do usuário.
    /// Retorna uma estrutura gRPC vazia ([`Empty`]) em caso de sucesso.
    async fn forgot_password(
        &self,
        request: Request<ForgotPasswordRequest>,
    ) -> Result<Response<Empty>, Status> {
        self.auth_use_case
            .forgot_password(request.into_inner().into())
            .await?;

        Ok(Response::from(Empty {}))
    }

    /// Endpoint para concluir a recuperação de senha.
    ///
    /// Valida o código OTP e a nova senha. Retorna uma estrutura gRPC
    /// vazia ([`Empty`]) em caso de sucesso.
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
