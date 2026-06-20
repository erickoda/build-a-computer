use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::{
    AppState,
    errors::AppError,
    modules::hardware::gpu::{
        dtos::{
            request::{create_gpu::CreateGpuRequestDto, update_gpu::UpdateGpuRequestDto},
            response::gpu::GpuDto,
        },
        mappers::update_gpu_request,
    },
    security::token::AuthenticatedUser,
};

/// Cria uma nova GPU no catálogo do microsserviço de benchmark.
#[utoipa::path(
    post,
    path = "/api/v1/hardware/gpus",
    request_body = CreateGpuRequestDto,
    responses(
        (status = 201, description = "GPU criada com sucesso", body = GpuDto),
        (status = 400, description = "Requisição inválida", body = AppError),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - GPU"
)]
pub async fn create_gpu(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Json(dto): Json<CreateGpuRequestDto>,
) -> Result<(StatusCode, Json<GpuDto>), AppError> {
    let grpc_response = app_state.gpu_client.create_gpu(dto.into(), &user).await?;

    Ok((StatusCode::CREATED, Json(grpc_response.into())))
}

/// Busca uma GPU específica pelo seu ID.
#[utoipa::path(
    get,
    path = "/api/v1/hardware/gpus/{id}",
    params(("id" = String, Path, description = "Identificador único da GPU")),
    responses(
        (status = 200, description = "GPU encontrada com sucesso", body = GpuDto),
        (status = 404, description = "GPU não encontrada", body = AppError)
    ),
    tag = "Hardware - GPU"
)]
pub async fn get_gpu(
    State(app_state): State<AppState>,
    Path(id): Path<String>,
) -> Result<(StatusCode, Json<GpuDto>), AppError> {
    let grpc_response = app_state.gpu_client.get_gpu(id).await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Lista todas as GPUs cadastradas.
#[utoipa::path(
    get,
    path = "/api/v1/hardware/gpus",
    responses(
        (status = 200, description = "Lista de GPUs recuperada com sucesso", body = [GpuDto])
    ),
    tag = "Hardware - GPU"
)]
pub async fn list_gpus(
    State(app_state): State<AppState>,
) -> Result<(StatusCode, Json<Vec<GpuDto>>), AppError> {
    let grpc_response = app_state.gpu_client.list_gpus().await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Atualiza uma GPU existente no catálogo do microsserviço de benchmark.
#[utoipa::path(
    patch,
    path = "/api/v1/hardware/gpus/{id}",
    params(("id" = String, Path, description = "Identificador único da GPU")),
    request_body = UpdateGpuRequestDto,
    responses(
        (status = 200, description = "GPU atualizada com sucesso", body = GpuDto),
        (status = 400, description = "Requisição inválida", body = AppError),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError),
        (status = 404, description = "GPU não encontrada", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - GPU"
)]
pub async fn update_gpu(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
    Json(dto): Json<UpdateGpuRequestDto>,
) -> Result<(StatusCode, Json<GpuDto>), AppError> {
    let grpc_response = app_state
        .gpu_client
        .update_gpu(update_gpu_request(id, dto), &user)
        .await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Remove uma GPU do catálogo com base no seu ID.
#[utoipa::path(
    delete,
    path = "/api/v1/hardware/gpus/{id}",
    params(("id" = String, Path, description = "Identificador único da GPU")),
    responses(
        (status = 204, description = "GPU removida com sucesso"),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError),
        (status = 404, description = "GPU não encontrada", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - GPU"
)]
pub async fn delete_gpu(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
) -> Result<StatusCode, AppError> {
    app_state.gpu_client.delete_gpu(id, &user).await?;

    Ok(StatusCode::NO_CONTENT)
}
