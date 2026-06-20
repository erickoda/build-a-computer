use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::{
    AppState,
    errors::AppError,
    modules::hardware::ssd::{
        dtos::{
            request::{create_ssd::CreateSsdRequestDto, update_ssd::UpdateSsdRequestDto},
            response::ssd::SsdDto,
        },
        mappers::update_ssd_request,
    },
    security::token::AuthenticatedUser,
};

/// Cria um novo SSD no catálogo do microsserviço de benchmark.
#[utoipa::path(
    post,
    path = "/api/v1/hardware/ssds",
    request_body = CreateSsdRequestDto,
    responses(
        (status = 201, description = "SSD criado com sucesso", body = SsdDto),
        (status = 400, description = "Requisição inválida", body = AppError),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - SSD"
)]
pub async fn create_ssd(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Json(dto): Json<CreateSsdRequestDto>,
) -> Result<(StatusCode, Json<SsdDto>), AppError> {
    let grpc_response = app_state.ssd_client.create_ssd(dto.into(), &user).await?;

    Ok((StatusCode::CREATED, Json(grpc_response.into())))
}

/// Busca um SSD específico pelo seu ID.
#[utoipa::path(
    get,
    path = "/api/v1/hardware/ssds/{id}",
    params(("id" = String, Path, description = "Identificador único do SSD")),
    responses(
        (status = 200, description = "SSD encontrado com sucesso", body = SsdDto),
        (status = 404, description = "SSD não encontrado", body = AppError)
    ),
    tag = "Hardware - SSD"
)]
pub async fn get_ssd(
    State(app_state): State<AppState>,
    Path(id): Path<String>,
) -> Result<(StatusCode, Json<SsdDto>), AppError> {
    let grpc_response = app_state.ssd_client.get_ssd(id).await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Lista todos os SSDs cadastrados.
#[utoipa::path(
    get,
    path = "/api/v1/hardware/ssds",
    responses(
        (status = 200, description = "Lista de SSDs recuperada com sucesso", body = [SsdDto])
    ),
    tag = "Hardware - SSD"
)]
pub async fn list_ssds(
    State(app_state): State<AppState>,
) -> Result<(StatusCode, Json<Vec<SsdDto>>), AppError> {
    let grpc_response = app_state.ssd_client.list_ssds().await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Atualiza um SSD existente no catálogo do microsserviço de benchmark.
#[utoipa::path(
    patch,
    path = "/api/v1/hardware/ssds/{id}",
    params(("id" = String, Path, description = "Identificador único do SSD")),
    request_body = UpdateSsdRequestDto,
    responses(
        (status = 200, description = "SSD atualizado com sucesso", body = SsdDto),
        (status = 400, description = "Requisição inválida", body = AppError),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError),
        (status = 404, description = "SSD não encontrado", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - SSD"
)]
pub async fn update_ssd(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
    Json(dto): Json<UpdateSsdRequestDto>,
) -> Result<(StatusCode, Json<SsdDto>), AppError> {
    let grpc_response = app_state
        .ssd_client
        .update_ssd(update_ssd_request(id, dto), &user)
        .await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Remove um SSD do catálogo com base no seu ID.
#[utoipa::path(
    delete,
    path = "/api/v1/hardware/ssds/{id}",
    params(("id" = String, Path, description = "Identificador único do SSD")),
    responses(
        (status = 204, description = "SSD removido com sucesso"),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError),
        (status = 404, description = "SSD não encontrado", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - SSD"
)]
pub async fn delete_ssd(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
) -> Result<StatusCode, AppError> {
    app_state.ssd_client.delete_ssd(id, &user).await?;

    Ok(StatusCode::NO_CONTENT)
}
