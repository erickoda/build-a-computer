use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::{
    AppState,
    errors::AppError,
    modules::hardware::psu::{
        dtos::{
            request::{create_psu::CreatePsuRequestDto, update_psu::UpdatePsuRequestDto},
            response::psu::PsuDto,
        },
        mappers::update_psu_request,
    },
    security::token::AuthenticatedUser,
};

/// Cria uma nova fonte de alimentação no catálogo do microsserviço de benchmark.
#[utoipa::path(
    post,
    path = "/api/v1/hardware/psus",
    request_body = CreatePsuRequestDto,
    responses(
        (status = 201, description = "Fonte de alimentação criada com sucesso", body = PsuDto),
        (status = 400, description = "Requisição inválida", body = AppError),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - Fonte"
)]
pub async fn create_psu(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Json(dto): Json<CreatePsuRequestDto>,
) -> Result<(StatusCode, Json<PsuDto>), AppError> {
    let grpc_response = app_state.psu_client.create_psu(dto.into(), &user).await?;

    Ok((StatusCode::CREATED, Json(grpc_response.into())))
}

/// Busca uma fonte de alimentação específica pelo seu ID.
#[utoipa::path(
    get,
    path = "/api/v1/hardware/psus/{id}",
    params(("id" = String, Path, description = "Identificador único da fonte de alimentação")),
    responses(
        (status = 200, description = "Fonte de alimentação encontrada com sucesso", body = PsuDto),
        (status = 404, description = "Fonte de alimentação não encontrada", body = AppError)
    ),
    tag = "Hardware - Fonte"
)]
pub async fn get_psu(
    State(app_state): State<AppState>,
    Path(id): Path<String>,
) -> Result<(StatusCode, Json<PsuDto>), AppError> {
    let grpc_response = app_state.psu_client.get_psu(id).await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Lista todas as fontes de alimentação cadastradas.
#[utoipa::path(
    get,
    path = "/api/v1/hardware/psus",
    responses(
        (status = 200, description = "Lista de fontes de alimentação recuperada com sucesso", body = [PsuDto])
    ),
    tag = "Hardware - Fonte"
)]
pub async fn list_psus(
    State(app_state): State<AppState>,
) -> Result<(StatusCode, Json<Vec<PsuDto>>), AppError> {
    let grpc_response = app_state.psu_client.list_psus().await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Atualiza uma fonte de alimentação existente no catálogo do microsserviço de benchmark.
#[utoipa::path(
    patch,
    path = "/api/v1/hardware/psus/{id}",
    params(("id" = String, Path, description = "Identificador único da fonte de alimentação")),
    request_body = UpdatePsuRequestDto,
    responses(
        (status = 200, description = "Fonte de alimentação atualizada com sucesso", body = PsuDto),
        (status = 400, description = "Requisição inválida", body = AppError),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError),
        (status = 404, description = "Fonte de alimentação não encontrada", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - Fonte"
)]
pub async fn update_psu(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
    Json(dto): Json<UpdatePsuRequestDto>,
) -> Result<(StatusCode, Json<PsuDto>), AppError> {
    let grpc_response = app_state
        .psu_client
        .update_psu(update_psu_request(id, dto), &user)
        .await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Remove uma fonte de alimentação do catálogo com base no seu ID.
#[utoipa::path(
    delete,
    path = "/api/v1/hardware/psus/{id}",
    params(("id" = String, Path, description = "Identificador único da fonte de alimentação")),
    responses(
        (status = 204, description = "Fonte de alimentação removida com sucesso"),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError),
        (status = 404, description = "Fonte de alimentação não encontrada", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - Fonte"
)]
pub async fn delete_psu(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
) -> Result<StatusCode, AppError> {
    app_state.psu_client.delete_psu(id, &user).await?;

    Ok(StatusCode::NO_CONTENT)
}
