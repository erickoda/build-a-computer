use axum::{Router, routing::post};

use crate::{
    AppState,
    modules::auth::handlers::{forgot_password, reset_password, sign_in, sign_up},
};

/// Configura e agrupa as rotas RESTful de autenticação.
///
/// Este roteador mapeia os endpoints públicos responsáveis pelo fluxo
/// de acesso, registro e recuperação de credenciais dos usuários.
///
/// # Endpoints
///
/// * `POST /sign-in` - Autentica um usuário e retorna o token de acesso (JWT).
/// * `POST /sign-up` - Registra um novo usuário no sistema e retorna o token de acesso.
/// * `POST /forgot-password` - Inicia o fluxo de recuperação de senha - envio de e-mail com código
///   OTP.
/// * `POST /reset-password` - Conclui a redefinição de senha utilizando um código válido.
pub fn auth_routes() -> Router<AppState> {
    Router::new()
        .route("/sign-in", post(sign_in))
        .route("/sign-up", post(sign_up))
        .route("/forgot-password", post(forgot_password))
        .route("/reset-password", post(reset_password))
}
