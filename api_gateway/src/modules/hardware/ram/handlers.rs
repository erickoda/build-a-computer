use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::{
    AppState,
    errors::AppError,
    modules::hardware::ram::{
        dtos::{
            request::{create_ram::CreateRamRequestDto, update_ram::UpdateRamRequestDto},
            response::ram::RamDto,
        },
        mappers::update_ram_request,
    },
    security::token::AuthenticatedUser,
};

/// Cria uma nova memória RAM no catálogo do microsserviço de benchmark.
#[utoipa::path(
    post,
    path = "/api/v1/hardware/rams",
    request_body = CreateRamRequestDto,
    responses(
        (status = 201, description = "Memória RAM criada com sucesso", body = RamDto),
        (status = 400, description = "Requisição inválida", body = AppError),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - RAM"
)]
pub async fn create_ram(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Json(dto): Json<CreateRamRequestDto>,
) -> Result<(StatusCode, Json<RamDto>), AppError> {
    let grpc_response = app_state.ram_client.create_ram(dto.into(), &user).await?;

    Ok((StatusCode::CREATED, Json(grpc_response.into())))
}

/// Busca uma memória RAM específica pelo seu ID.
#[utoipa::path(
    get,
    path = "/api/v1/hardware/rams/{id}",
    params(("id" = String, Path, description = "Identificador único da memória RAM")),
    responses(
        (status = 200, description = "Memória RAM encontrada com sucesso", body = RamDto),
        (status = 404, description = "Memória RAM não encontrada", body = AppError)
    ),
    tag = "Hardware - RAM"
)]
pub async fn get_ram(
    State(app_state): State<AppState>,
    Path(id): Path<String>,
) -> Result<(StatusCode, Json<RamDto>), AppError> {
    let grpc_response = app_state.ram_client.get_ram(id).await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Lista todas as memórias RAM cadastradas.
#[utoipa::path(
    get,
    path = "/api/v1/hardware/rams",
    responses(
        (status = 200, description = "Lista de memórias RAM recuperada com sucesso", body = [RamDto])
    ),
    tag = "Hardware - RAM"
)]
pub async fn list_rams(
    State(app_state): State<AppState>,
) -> Result<(StatusCode, Json<Vec<RamDto>>), AppError> {
    let grpc_response = app_state.ram_client.list_rams().await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Atualiza uma memória RAM existente no catálogo do microsserviço de benchmark.
#[utoipa::path(
    patch,
    path = "/api/v1/hardware/rams/{id}",
    params(("id" = String, Path, description = "Identificador único da memória RAM")),
    request_body = UpdateRamRequestDto,
    responses(
        (status = 200, description = "Memória RAM atualizada com sucesso", body = RamDto),
        (status = 400, description = "Requisição inválida", body = AppError),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError),
        (status = 404, description = "Memória RAM não encontrada", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - RAM"
)]
pub async fn update_ram(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
    Json(dto): Json<UpdateRamRequestDto>,
) -> Result<(StatusCode, Json<RamDto>), AppError> {
    let grpc_response = app_state
        .ram_client
        .update_ram(update_ram_request(id, dto), &user)
        .await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Remove uma memória RAM do catálogo com base no seu ID.
#[utoipa::path(
    delete,
    path = "/api/v1/hardware/rams/{id}",
    params(("id" = String, Path, description = "Identificador único da memória RAM")),
    responses(
        (status = 204, description = "Memória RAM removida com sucesso"),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError),
        (status = 404, description = "Memória RAM não encontrada", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - RAM"
)]
pub async fn delete_ram(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
) -> Result<StatusCode, AppError> {
    app_state.ram_client.delete_ram(id, &user).await?;

    Ok(StatusCode::NO_CONTENT)
}
