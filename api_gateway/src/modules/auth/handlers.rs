use axum::{Json, extract::State, http::StatusCode};

use crate::{
    AppState,
    errors::AppError,
    modules::auth::dtos::{request::{sign_in::SignInRequestDto, sign_up::SignUpRequestDto}, response::auth::AuthResponseDto},
};

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
