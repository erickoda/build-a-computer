use axum::{
    Json,
    extract::{Path, State},
    http::StatusCode,
};

use crate::{
    AppState,
    errors::AppError,
    modules::game::{
        dtos::{
            request::{create_game::CreateGameRequestDto, update_game::UpdateGameRequestDto},
            response::game::GameDto,
        },
        mappers::update_game_request,
    },
    security::token::AuthenticatedUser,
};

/// Cria um novo jogo no catálogo do microsserviço de benchmark.
#[utoipa::path(
    post,
    path = "/api/v1/games",
    request_body = CreateGameRequestDto,
    responses(
        (status = 201, description = "Jogo criado com sucesso", body = GameDto),
        (status = 400, description = "Requisição inválida", body = AppError),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Jogos"
)]
pub async fn create_game(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Json(dto): Json<CreateGameRequestDto>,
) -> Result<(StatusCode, Json<GameDto>), AppError> {
    let grpc_response = app_state.game_client.create_game(dto.into(), &user).await?;

    Ok((StatusCode::CREATED, Json(grpc_response.into())))
}

/// Busca um jogo específico pelo seu ID.
#[utoipa::path(
    get,
    path = "/api/v1/games/{id}",
    params(("id" = String, Path, description = "Identificador único do jogo")),
    responses(
        (status = 200, description = "Jogo encontrado com sucesso", body = GameDto),
        (status = 404, description = "Jogo não encontrado", body = AppError)
    ),
    tag = "Jogos"
)]
pub async fn get_game(
    State(app_state): State<AppState>,
    Path(id): Path<String>,
) -> Result<(StatusCode, Json<GameDto>), AppError> {
    let grpc_response = app_state.game_client.get_game(id).await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Lista todos os jogos cadastrados.
#[utoipa::path(
    get,
    path = "/api/v1/games",
    responses(
        (status = 200, description = "Lista de jogos recuperada com sucesso", body = [GameDto])
    ),
    tag = "Jogos"
)]
pub async fn list_games(
    State(app_state): State<AppState>,
) -> Result<(StatusCode, Json<Vec<GameDto>>), AppError> {
    let grpc_response = app_state.game_client.list_games().await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Atualiza um jogo existente no catálogo do microsserviço de benchmark.
#[utoipa::path(
    patch,
    path = "/api/v1/games/{id}",
    params(("id" = String, Path, description = "Identificador único do jogo")),
    request_body = UpdateGameRequestDto,
    responses(
        (status = 200, description = "Jogo atualizado com sucesso", body = GameDto),
        (status = 400, description = "Requisição inválida", body = AppError),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError),
        (status = 404, description = "Jogo não encontrado", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Jogos"
)]
pub async fn update_game(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
    Json(dto): Json<UpdateGameRequestDto>,
) -> Result<(StatusCode, Json<GameDto>), AppError> {
    let grpc_response = app_state
        .game_client
        .update_game(update_game_request(id, dto), &user)
        .await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Remove um jogo do catálogo com base no seu ID.
#[utoipa::path(
    delete,
    path = "/api/v1/games/{id}",
    params(("id" = String, Path, description = "Identificador único do jogo")),
    responses(
        (status = 204, description = "Jogo removido com sucesso"),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 403, description = "Acesso negado: Privilégios insuficientes (requer supervisor ou admin)", body = AppError),
        (status = 404, description = "Jogo não encontrado", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Jogos"
)]
pub async fn delete_game(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
) -> Result<StatusCode, AppError> {
    app_state.game_client.delete_game(id, &user).await?;

    Ok(StatusCode::NO_CONTENT)
}
