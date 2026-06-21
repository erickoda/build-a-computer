use chrono::{DateTime, Utc};
use prost_types::Timestamp as ProstTimestamp;

use crate::{
    benchmark_grpc,
    modules::game::dtos::request::{create_game::CreateGameRequestDto, update_game::UpdateGameRequestDto},
};

use super::dtos::response::game::GameDto;

fn from_prost_timestamp(ts: ProstTimestamp) -> DateTime<Utc> {
    DateTime::from_timestamp(ts.seconds, ts.nanos.max(0) as u32).unwrap_or_default()
}

impl From<CreateGameRequestDto> for benchmark_grpc::CreateGameRequest {
    fn from(dto: CreateGameRequestDto) -> Self {
        Self {
            name: dto.name().to_string(),
            img: dto.img(),
            necessary_disk: dto.necessary_disk(),
        }
    }
}

pub fn update_game_request(id: String, dto: UpdateGameRequestDto) -> benchmark_grpc::UpdateGameRequest {
    benchmark_grpc::UpdateGameRequest {
        id,
        name: dto.name().to_string(),
        img: dto.img(),
        necessary_disk: dto.necessary_disk(),
    }
}

impl From<benchmark_grpc::GameResponse> for GameDto {
    fn from(game: benchmark_grpc::GameResponse) -> Self {
        Self::new(
            game.id,
            game.name,
            game.img,
            game.necessary_disk,
            game.created_at.map(from_prost_timestamp).unwrap_or_default(),
            game.updated_at.map(from_prost_timestamp),
        )
    }
}

impl From<benchmark_grpc::ListGameResponse> for Vec<GameDto> {
    fn from(list: benchmark_grpc::ListGameResponse) -> Self {
        list.games.into_iter().map(GameDto::from).collect()
    }
}
