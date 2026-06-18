use axum::{Json, extract::State, http::StatusCode};

use crate::{
    AppState,
    errors::AppError,
    modules::recommendation::dtos::{request::recommendation::BuildPCRequestDto, response::pc::Pc},
};

pub async fn get_recommendation(
    State(app_state): State<AppState>,
    Json(dto): Json<BuildPCRequestDto>,
) -> Result<(StatusCode, Json<Vec<Pc>>), AppError> {
    let grpc_response = app_state
        .recommendation_client
        .recommned(
            dto.get_games().to_vec(),
            dto.get_max_price(),
            dto.get_resolution(),
            dto.get_computer_perfomance().to_string(),
        )
        .await?;

    Ok((StatusCode::CREATED, Json(grpc_response.into())))
}
