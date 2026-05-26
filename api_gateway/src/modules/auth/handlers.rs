use axum::{extract::State, http::StatusCode, Json};

use crate::{
    auth_grpc,
    errors::AppError,
    modules::auth::dtos::{request::auth::AuthRequestDto, response::auth::AuthResponse},
    AppState,
};

pub async fn authenticate(
    State(app_state): State<AppState>,
    Json(dto): Json<AuthRequestDto>,
) -> Result<(StatusCode, Json<AuthResponse>), AppError> {
    let grpc_request = auth_grpc::AuthRequest {
        email: dto.get_email().to_string(),
        password: dto.get_password().to_string(),
    };

    let mut client = app_state.auth_client.clone();

    let grpc_response = client.authenticate_user(grpc_request).await?.into_inner();

    Ok((
        StatusCode::CREATED,
        Json(AuthResponse::new(grpc_response.token)),
    ))
}
