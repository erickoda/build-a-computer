use axum::{Json, extract::State, http::StatusCode};

use crate::{
    AppState,
    errors::AppError,
    modules::auth::dtos::{
        request::{
            forgot_password::ForgotPasswordDto, reset_password::ResetPasswordDto,
            sign_in::SignInRequestDto, sign_up::SignUpRequestDto,
        },
        response::auth::AuthResponseDto,
    },
};

/// Realiza o login de um usuário existente.
///
/// Valida as credenciais (e-mail e senha) enviadas no corpo da requisição
/// junto ao microsserviço. Em caso de sucesso, retorna um status `200 OK`
/// contendo o token de acesso (JWT).
#[utoipa::path(
    post,
    path = "/api/v1/auth/sign-in",
    request_body = SignInRequestDto,
    responses(
        (status = 200, description = "Login bem-sucedido", body = AuthResponseDto),
        (status = 401, description = "Credenciais inválidas", body = AppError),
        (status = 500, description = "Erro interno do servidor")
    ),
    tag = "Autenticação"
)]
pub async fn sign_in(
    State(app_state): State<AppState>,
    Json(dto): Json<SignInRequestDto>,
) -> Result<(StatusCode, Json<AuthResponseDto>), AppError> {
    let token = app_state
        .auth_client
        .sign_in(dto.get_email(), dto.get_password())
        .await?;

    Ok((StatusCode::OK, Json(AuthResponseDto::new(token))))
}

/// Registra um novo usuário no sistema.
///
/// Repassa os dados de criação (e-mail, senha e nome de usuário) para o
/// microsserviço. Se o cadastro for bem-sucedido, o microsserviço já autentica
/// o usuário e retorna um status `200 OK` com o token de acesso.
#[utoipa::path(
    post,
    path = "/api/v1/auth/sign-up",
    request_body = SignUpRequestDto,
    responses(
        (status = 200, description = "Usuário criado e autenticado com sucesso", body = AuthResponseDto),
        (status = 409, description = "Conflito: E-mail já está em uso", body = AppError),
        (status = 500, description = "Erro interno do servidor")
    ),
    tag = "Autenticação"
)]
pub async fn sign_up(
    State(app_state): State<AppState>,
    Json(dto): Json<SignUpRequestDto>,
) -> Result<(StatusCode, Json<AuthResponseDto>), AppError> {
    let token = app_state
        .auth_client
        .sign_up(dto.get_email(), dto.get_password(), dto.get_username())
        .await?;

    Ok((StatusCode::OK, Json(AuthResponseDto::new(token))))
}

/// Solicita a recuperação de senha de um usuário.
///
/// Aciona o microsserviço para gerar e enviar um código OTP (One-Time Password)
/// para o e-mail informado. Retorna sempre `204 No Content` em caso de sucesso
/// no enfileiramento ou processamento do pedido.
#[utoipa::path(
    post,
    path = "/api/v1/auth/forgot-password",
    request_body = ForgotPasswordDto,
    responses(
        (status = 204, description = "Solicitação processada com sucesso (OTP enviado)"),
        (status = 400, description = "Dados inválidos na requisição", body = AppError)
    ),
    tag = "Autenticação"
)]
pub async fn forgot_password(
    State(app_state): State<AppState>,
    Json(dto): Json<ForgotPasswordDto>,
) -> Result<StatusCode, AppError> {
    app_state
        .auth_client
        .forgot_password(dto.get_email())
        .await?;

    Ok(StatusCode::NO_CONTENT)
}

/// Redefine a senha de um usuário autenticado por OTP.
///
/// Recebe o e-mail, a nova senha e o código de verificação (OTP) gerado
/// na etapa de `forgot_password`. Se o OTP for válido, a senha é alterada
/// e o endpoint retorna `204 No Content`.
#[utoipa::path(
    post,
    path = "/api/v1/auth/reset-password",
    request_body = ResetPasswordDto,
    responses(
        (status = 204, description = "Senha redefinida com sucesso"),
        (status = 401, description = "Código OTP inválido ou expirado", body = AppError)
    ),
    tag = "Autenticação"
)]
pub async fn reset_password(
    State(app_state): State<AppState>,
    Json(dto): Json<ResetPasswordDto>,
) -> Result<StatusCode, AppError> {
    app_state
        .auth_client
        .reset_password(dto.get_email(), dto.get_otp(), dto.get_new_password())
        .await?;

    Ok(StatusCode::NO_CONTENT)
}
