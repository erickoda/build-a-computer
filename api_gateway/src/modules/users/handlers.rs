use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use uuid::Uuid;

use crate::{
    errors::AppError,
    extractor::auth::{with_auth_metadata, AuthenticatedUser},
    modules::users::dtos::{request::create_user::CreateUserRequestDto, response::user::UserDto},
    users_grpc, AppState,
};

pub async fn create_user(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Json(dto): Json<CreateUserRequestDto>,
) -> Result<(StatusCode, Json<UserDto>), AppError> {
    let grpc_payload = users_grpc::CreateUserRequest {
        username: dto.get_username().to_string(),
        email: dto.get_email().to_string(),
        password: dto.get_password().to_string(),
        role: users_grpc::Role::from(dto.get_role()).into(),
    };

    let grpc_request = with_auth_metadata(grpc_payload, &user)?;

    let mut client = app_state.user_client.clone();

    let grpc_response: users_grpc::User = client.create_user(grpc_request).await?.into_inner();

    Ok((StatusCode::CREATED, Json(UserDto::try_from(grpc_response)?)))
}

pub async fn get_user(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<Uuid>,
) -> Result<(StatusCode, Json<UserDto>), AppError> {
    let grpc_payload = users_grpc::UserId { id: id.to_string() };

    let grpc_request = with_auth_metadata(grpc_payload, &user)?;

    let mut client = app_state.user_client.clone();

    let grpc_response = client.get_user(grpc_request).await?.into_inner();

    Ok((StatusCode::OK, Json(UserDto::try_from(grpc_response)?)))
}

pub async fn get_users(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
) -> Result<(StatusCode, Json<Vec<UserDto>>), AppError> {
    let grpc_payload = users_grpc::Empty {};

    let grpc_request = with_auth_metadata(grpc_payload, &user)?;

    let mut client = app_state.user_client.clone();

    let grpc_response = client.get_users(grpc_request).await?.into_inner();

    let users: Vec<UserDto> = grpc_response.try_into()?;

    Ok((StatusCode::OK, Json(users)))
}

pub async fn delete_user(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let grpc_payload = users_grpc::UserId { id: id.to_string() };

    let grpc_request = with_auth_metadata(grpc_payload, &user)?;

    let mut client = app_state.user_client.clone();

    client.delete_user(grpc_request).await?.into_inner();

    Ok(StatusCode::NO_CONTENT)
}
