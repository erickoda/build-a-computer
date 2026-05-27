use axum::{Json, extract::State, http::StatusCode};

use crate::{
    AppState,
    errors::AppError,
    modules::auth::dtos::{request::auth::AuthRequestDto, response::auth::AuthResponse},
};

pub async fn authenticate(
    State(app_state): State<AppState>,
    Json(dto): Json<AuthRequestDto>,
) -> Result<(StatusCode, Json<AuthResponse>), AppError> {
    let token = app_state
        .auth_client
        .authenticate_user(dto.get_email(), dto.get_password())
        .await?;

    Ok((StatusCode::OK, Json(AuthResponse::new(token))))
}
