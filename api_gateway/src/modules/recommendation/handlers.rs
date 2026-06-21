use axum::{
    Json,
    extract::{Query, State},
    http::StatusCode,
};

use crate::{
    AppState,
    errors::AppError,
    modules::recommendation::dtos::{
        request::recommendation::RecommendationRequestDto, response::pc::Pc,
    },
};

/// Processa uma requisição GET HTTP para obter sugestões de hardware.
///
/// Este handler recebe o estado global da aplicação e os critérios do usuário via query
/// string, delega a lógica de recomendação para o microserviço gRPC e retorna a lista
/// de computadores gerada.
///
/// # Erros
///
/// Retorna um `AppError` caso ocorra falha de comunicação ou processamento no cliente gRPC.
#[utoipa::path(
    get,
    path = "/api/v1/recommendation",
    params(RecommendationRequestDto),
    responses(
        (status = 200, description = "Lista de computadores recomendados gerada com sucesso", body = Vec<Pc>),
        (status = 400, description = "Requisição inválida", body = AppError),
        (status = 500, description = "Erro interno de comunicação com o gRPC", body = AppError)
    ),
    tag = "Recomendação"
)]
pub async fn get_recommendation(
    State(app_state): State<AppState>,
    Query(dto): Query<RecommendationRequestDto>,
) -> Result<(StatusCode, Json<Vec<Pc>>), AppError> {
    let grpc_response = app_state
        .recommendation_client
        .recommend(
            dto.get_games(),
            dto.get_max_price(),
            dto.get_resolution(),
            dto.get_computer_performance().to_string(),
        )
        .await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}
