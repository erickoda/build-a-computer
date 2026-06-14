use crate::{
    application::{
        commands::{
            forgot_password::ForgotPasswordCommand, reset_password::ResetPasswordCommand,
            sign_in::SignInCommand, sign_up::SignUpCommand,
        },
        outputs::auth::AuthOutput,
    },
    auth_grpc::{
        AuthReply, ForgotPasswordRequest, ResetPasswordRequest, SignInRequest, SignUpRequest,
    },
};

/// Converte o payload gRPC de solicitação de recuperação de senha para o Comando interno.
impl Into<ForgotPasswordCommand> for ForgotPasswordRequest {
    fn into(self) -> ForgotPasswordCommand {
        ForgotPasswordCommand::new(self.email)
    }
}

/// Converte o payload gRPC de redefinição de senha (com o código OTP) para o Comando interno.
impl Into<ResetPasswordCommand> for ResetPasswordRequest {
    fn into(self) -> ResetPasswordCommand {
        ResetPasswordCommand::new(self.email, self.otp, self.new_password)
    }
}

/// Converte o payload gRPC de login para o Comando interno.
impl Into<SignInCommand> for SignInRequest {
    fn into(self) -> SignInCommand {
        SignInCommand::new(self.email, self.password)
    }
}

/// Converte o payload gRPC de criação de conta para o Comando interno.
impl Into<SignUpCommand> for SignUpRequest {
    fn into(self) -> SignUpCommand {
        SignUpCommand::new(self.username, self.email, self.password)
    }
}

/// Converte a resposta estruturada do Caso de Uso (Output) para o formato esperado pelo gRPC.
impl From<AuthOutput> for AuthReply {
    fn from(auth_output: AuthOutput) -> Self {
        Self {
            token: auth_output.get_token().into(),
        }
    }
}
