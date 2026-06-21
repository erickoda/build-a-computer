use axum::{
    Router,
    routing::{get, patch, post},
};

use crate::{
    AppState,
    modules::game::handlers::{create_game, delete_game, get_game, list_games, update_game},
};

/// Cria e configura o roteador do Axum para os endpoints do catálogo de jogos.
pub fn game_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_game))
        .route("/", get(list_games))
        .route("/{id}", get(get_game))
        .route("/{id}", patch(update_game))
        .route("/{id}", axum::routing::delete(delete_game))
}
