use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use uuid::Uuid;

use crate::{
    AppState,
    errors::AppError,
    modules::users::dtos::{request::create_user::CreateUserRequestDto, response::user::UserDto},
    security::token::AuthenticatedUser,
};

pub async fn create_user(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Json(dto): Json<CreateUserRequestDto>,
) -> Result<(StatusCode, Json<UserDto>), AppError> {
    let grpc_response = app_state
        .user_client
        .create_user(
            dto.get_username().to_string(),
            dto.get_email().to_string(),
            dto.get_password().to_string(),
            dto.get_role().into(),
            &user,
        )
        .await?;

    Ok((StatusCode::CREATED, Json(UserDto::try_from(grpc_response)?)))
}

pub async fn get_user(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<Uuid>,
) -> Result<(StatusCode, Json<UserDto>), AppError> {
    let grpc_response = app_state
        .user_client
        .get_user(id.to_string(), &user)
        .await?;

    Ok((StatusCode::OK, Json(UserDto::try_from(grpc_response)?)))
}

pub async fn get_users(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
) -> Result<(StatusCode, Json<Vec<UserDto>>), AppError> {
    let grpc_response = app_state.user_client.get_users(&user).await?;

    let users: Vec<UserDto> = grpc_response.try_into()?;

    Ok((StatusCode::OK, Json(users)))
}

pub async fn delete_user(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    app_state
        .user_client
        .delete_user(id.to_string(), &user)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}
