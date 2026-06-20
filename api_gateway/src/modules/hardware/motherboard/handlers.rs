use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::{
    AppState,
    errors::AppError,
    modules::hardware::motherboard::dtos::{
        request::create_motherboard::CreateMotherBoardRequestDto,
        response::motherboard::MotherBoardDto,
    },
    security::token::AuthenticatedUser,
};

/// Cria uma nova placa-mãe no catálogo do microsserviço de benchmark.
#[utoipa::path(
    post,
    path = "/api/v1/hardware/motherboards",
    request_body = CreateMotherBoardRequestDto,
    responses(
        (status = 201, description = "Placa-mãe criada com sucesso", body = MotherBoardDto),
        (status = 400, description = "Requisição inválida", body = AppError),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - Placa-mãe"
)]
pub async fn create_motherboard(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Json(dto): Json<CreateMotherBoardRequestDto>,
) -> Result<(StatusCode, Json<MotherBoardDto>), AppError> {
    let grpc_response = app_state
        .motherboard_client
        .create_motherboard(dto.into(), &user)
        .await?;

    Ok((StatusCode::CREATED, Json(grpc_response.into())))
}

/// Busca uma placa-mãe específica pelo seu ID.
#[utoipa::path(
    get,
    path = "/api/v1/hardware/motherboards/{id}",
    params(("id" = String, Path, description = "Identificador único da placa-mãe")),
    responses(
        (status = 200, description = "Placa-mãe encontrada com sucesso", body = MotherBoardDto),
        (status = 404, description = "Placa-mãe não encontrada", body = AppError)
    ),
    tag = "Hardware - Placa-mãe"
)]
pub async fn get_motherboard(
    State(app_state): State<AppState>,
    Path(id): Path<String>,
) -> Result<(StatusCode, Json<MotherBoardDto>), AppError> {
    let grpc_response = app_state.motherboard_client.get_motherboard(id).await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Lista todas as placas-mãe cadastradas.
#[utoipa::path(
    get,
    path = "/api/v1/hardware/motherboards",
    responses(
        (status = 200, description = "Lista de placas-mãe recuperada com sucesso", body = [MotherBoardDto])
    ),
    tag = "Hardware - Placa-mãe"
)]
pub async fn list_motherboards(
    State(app_state): State<AppState>,
) -> Result<(StatusCode, Json<Vec<MotherBoardDto>>), AppError> {
    let grpc_response = app_state.motherboard_client.list_motherboards().await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Remove uma placa-mãe do catálogo com base no seu ID.
#[utoipa::path(
    delete,
    path = "/api/v1/hardware/motherboards/{id}",
    params(("id" = String, Path, description = "Identificador único da placa-mãe")),
    responses(
        (status = 204, description = "Placa-mãe removida com sucesso"),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError),
        (status = 404, description = "Placa-mãe não encontrada", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Hardware - Placa-mãe"
)]
pub async fn delete_motherboard(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
) -> Result<StatusCode, AppError> {
    app_state
        .motherboard_client
        .delete_motherboard(id, &user)
        .await?;

    Ok(StatusCode::NO_CONTENT)
}
