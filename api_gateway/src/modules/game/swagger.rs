use utoipa::OpenApi;

use crate::modules::game::{dtos, handlers};

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::create_game,
        handlers::get_game,
        handlers::list_games,
        handlers::update_game,
        handlers::delete_game
    ),
    components(schemas(
        dtos::request::create_game::CreateGameRequestDto,
        dtos::request::update_game::UpdateGameRequestDto,
        dtos::response::game::GameDto,
    ))
)]
pub struct GameApi;
