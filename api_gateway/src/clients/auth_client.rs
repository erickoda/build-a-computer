use tonic::transport::Channel;

use crate::{
    auth_grpc::{self, auth_client::AuthClient},
    errors::AppError,
};

/// Wrapper para o cliente gRPC de usuários.
///
/// Mantém o canal de comunicação persistente com o microsserviço.
/// Expões método públicos que não exigem autenticação.
#[derive(Clone)]
pub struct AuthClientWrapper {
    inner_client: AuthClient<Channel>,
}

impl AuthClientWrapper {
    /// Inicializa um novo wrapper utilizando um `Channel` existente.
    pub fn new(channel: Channel) -> Self {
        Self {
            inner_client: AuthClient::new(channel),
        }
    }

    /// Autentica um usuário existente com base em e-mail e senha.
    ///
    /// Retorna o token de acesso (JWT) em formato de string gerado pelo microsserviço
    /// em caso de credenciais válidas.
    ///
    /// # Erros
    ///
    /// Retorna [`AppError`] caso a autenticação falhe (ex: senha incorreta ou usuário inexistente).
    pub async fn sign_in(&self, email: &str, password: &str) -> Result<String, AppError> {
        let mut client = self.inner_client.clone();

        let grpc_request = tonic::Request::new(auth_grpc::SignInRequest {
            email: email.to_string(),
            password: password.to_string(),
        });

        let grpc_response = client.sign_in(grpc_request).await?.into_inner();

        Ok(grpc_response.token)
    }

    /// Cadastra um novo usuário no sistema.
    ///
    /// Envia os dados para registro e, caso o cadastro ocorra com sucesso,
    /// o microsserviço já retorna o token (JWT) correspondente à nova sessão iniciada.
    pub async fn sign_up(
        &self,
        email: &str,
        password: &str,
        username: &str,
    ) -> Result<String, AppError> {
        let mut client = self.inner_client.clone();

        let grpc_request = tonic::Request::new(auth_grpc::SignUpRequest {
            email: email.to_string(),
            password: password.to_string(),
            username: username.to_string(),
        });

        let grpc_response = client.sign_up(grpc_request).await?.into_inner();

        Ok(grpc_response.token)
    }

    /// Inicia o processo de recuperação de senha por esquecimento.
    ///
    /// Solicita ao microsserviço o disparo de um código de verificação temporário (OTP)
    /// associado ao e-mail informado.
    pub async fn forgot_password(&self, email: &str) -> Result<(), AppError> {
        let mut client = self.inner_client.clone();

        let grpc_request = tonic::Request::new(auth_grpc::ForgotPasswordRequest {
            email: email.to_string(),
        });

        client.forgot_password(grpc_request).await?;

        Ok(())
    }

    /// Conclui a redefinição de senha utilizando o código OTP recebido.
    ///
    /// Atualiza as credenciais do usuário no banco de dados caso o código OTP
    /// corresponda ao e-mail e ainda esteja dentro do prazo de validade.
    pub async fn reset_password(
        &self,
        email: &str,
        otp: &str,
        new_password: &str,
    ) -> Result<(), AppError> {
        let mut client = self.inner_client.clone();

        let grpc_request = tonic::Request::new(auth_grpc::ResetPasswordRequest {
            email: email.to_string(),
            otp: otp.to_string(),
            new_password: new_password.to_string(),
        });

        client.reset_password(grpc_request).await?;

        Ok(())
    }
}
