use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};
use uuid::Uuid;

use crate::{
    AppState,
    errors::AppError,
    modules::users::dtos::{
        request::{create_user::CreateUserRequestDto, update_user::UpdateUserDto},
        response::user::UserDto,
    },
    security::token::AuthenticatedUser,
};

/// Cria um novo usuário no sistema.
///
/// Extrai o payload JSON validado, envia a solicitação para o microsserviço
/// e retorna um status `201 Created` contendo os dados do usuário recém-criado.
#[utoipa::path(
    post,
    path = "/api/v1/users",
    request_body = CreateUserRequestDto,
    responses(
        (status = 201, description = "Usuário criado com sucesso", body = UserDto),
        (status = 400, description = "Dados inválidos", body = AppError),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Usuários"
)]
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

/// Busca as informações de um usuário específico.
///
/// Extrai o `id` (UUID) diretamente da URL, como parâmetro, e retorna
/// um status `200 OK` com os detalhes do usuário encontrados pelo microsserviço.
#[utoipa::path(
    get,
    path = "/api/v1/users/{id}",
    params(
        ("id" = Uuid, Path, description = "Identificador único (UUID) do usuário")
    ),
    responses(
        (status = 200, description = "Usuário encontrado com sucesso", body = UserDto),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 404, description = "Usuário não encontrado", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Usuários"
)]
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

/// Lista todos os usuários cadastrados.
///
/// Requisita a lista completa ao microsserviço e retorna um status `200 OK`
/// contendo um vetor de usuários mapeados para suas respectivas DTOs de resposta.
#[utoipa::path(
    get,
    path = "/api/v1/users",
    responses(
        (status = 200, description = "Lista de usuários recuperada com sucesso", body = [UserDto]),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Usuários"
)]
pub async fn get_users(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
) -> Result<(StatusCode, Json<Vec<UserDto>>), AppError> {
    let grpc_response = app_state.user_client.get_users(&user).await?;

    let users: Vec<UserDto> = grpc_response.try_into()?;

    Ok((StatusCode::OK, Json(users)))
}

/// Soft delete de um usuário do sistema.
///
/// Extrai o `id` da URL, solicita a exclusão ao microsserviço e, em caso de
/// sucesso, retorna um status `204 No Content` (sem corpo de resposta).
#[utoipa::path(
    delete,
    path = "/api/v1/users/{id}",
    params(
        ("id" = Uuid, Path, description = "Identificador único (UUID) do usuário a ser removido")
    ),
    responses(
        (status = 204, description = "Usuário removido com sucesso (Soft Delete)"),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes", body = AppError),
        (status = 404, description = "Usuário não encontrado", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Usuários"
)]
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

/// Atualiza as informações de um usuário existente.
///
/// Recebe o `id` pela URL e os campos a serem alterados pelo corpo (JSON).
/// Campos ausentes no DTO (`None`) não serão alterados pelo microsserviço.
/// Retorna um status `204 No Content` em caso de sucesso.
#[utoipa::path(
    put, // ou patch, dependendo do seu roteamento no Axum
    path = "/api/v1/users/{id}",
    params(
        ("id" = Uuid, Path, description = "Identificador único (UUID) do usuário a ser atualizado")
    ),
    request_body = UpdateUserDto,
    responses(
        (status = 204, description = "Usuário atualizado com sucesso"),
        (status = 400, description = "Dados inválidos", body = AppError),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes", body = AppError),
        (status = 404, description = "Usuário não encontrado", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Usuários"
)]
pub async fn update_user(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<Uuid>,
    Json(dto): Json<UpdateUserDto>,
) -> Result<StatusCode, AppError> {
    app_state
        .user_client
        .update_user(
            id.to_string(),
            dto.get_username().to_owned(),
            dto.get_email().to_owned(),
            dto.get_password().to_owned(),
            dto.get_role().map(Into::into).to_owned(),
            dto.get_status().map(Into::into).to_owned(),
            &user,
        )
        .await?;

    Ok(StatusCode::NO_CONTENT)
}
