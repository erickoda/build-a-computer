use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::{
    AppState,
    errors::AppError,
    modules::hardware::cpu::{
        dtos::{
            request::{create_cpu::CreateCpuRequestDto, update_cpu::UpdateCpuRequestDto},
            response::cpu::CpuDto,
        },
        mappers::update_cpu_request,
    },
    security::token::AuthenticatedUser,
};

/// Cria uma nova CPU no catálogo do microsserviço de benchmark.
#[utoipa::path(
    post,
    path = "/api/v1/hardware/cpus",
    request_body = CreateCpuRequestDto,
    responses(
        (status = 201, description = "CPU criada com sucesso", body = CpuDto),
        (status = 400, description = "Requisição inválida", body = AppError),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - CPU"
)]
pub async fn create_cpu(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Json(dto): Json<CreateCpuRequestDto>,
) -> Result<(StatusCode, Json<CpuDto>), AppError> {
    let grpc_response = app_state.cpu_client.create_cpu(dto.into(), &user).await?;

    Ok((StatusCode::CREATED, Json(grpc_response.into())))
}

/// Busca uma CPU específica pelo seu ID.
#[utoipa::path(
    get,
    path = "/api/v1/hardware/cpus/{id}",
    params(("id" = String, Path, description = "Identificador único da CPU")),
    responses(
        (status = 200, description = "CPU encontrada com sucesso", body = CpuDto),
        (status = 404, description = "CPU não encontrada", body = AppError)
    ),
    tag = "Hardware - CPU"
)]
pub async fn get_cpu(
    State(app_state): State<AppState>,
    Path(id): Path<String>,
) -> Result<(StatusCode, Json<CpuDto>), AppError> {
    let grpc_response = app_state.cpu_client.get_cpu(id).await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Lista todas as CPUs cadastradas.
#[utoipa::path(
    get,
    path = "/api/v1/hardware/cpus",
    responses(
        (status = 200, description = "Lista de CPUs recuperada com sucesso", body = [CpuDto])
    ),
    tag = "Hardware - CPU"
)]
pub async fn list_cpus(
    State(app_state): State<AppState>,
) -> Result<(StatusCode, Json<Vec<CpuDto>>), AppError> {
    let grpc_response = app_state.cpu_client.list_cpus().await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Atualiza uma CPU existente no catálogo do microsserviço de benchmark.
#[utoipa::path(
    patch,
    path = "/api/v1/hardware/cpus/{id}",
    params(("id" = String, Path, description = "Identificador único da CPU")),
    request_body = UpdateCpuRequestDto,
    responses(
        (status = 200, description = "CPU atualizada com sucesso", body = CpuDto),
        (status = 400, description = "Requisição inválida", body = AppError),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError),
        (status = 404, description = "CPU não encontrada", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - CPU"
)]
pub async fn update_cpu(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
    Json(dto): Json<UpdateCpuRequestDto>,
) -> Result<(StatusCode, Json<CpuDto>), AppError> {
    let grpc_response = app_state
        .cpu_client
        .update_cpu(update_cpu_request(id, dto), &user)
        .await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Remove uma CPU do catálogo com base no seu ID.
#[utoipa::path(
    delete,
    path = "/api/v1/hardware/cpus/{id}",
    params(("id" = String, Path, description = "Identificador único da CPU")),
    responses(
        (status = 204, description = "CPU removida com sucesso"),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError),
        (status = 404, description = "CPU não encontrada", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - CPU"
)]
pub async fn delete_cpu(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
) -> Result<StatusCode, AppError> {
    app_state.cpu_client.delete_cpu(id, &user).await?;

    Ok(StatusCode::NO_CONTENT)
}
