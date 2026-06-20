use axum::{
    Router,
    routing::{get, post},
};

use crate::{
    AppState,
    modules::hardware::ram::handlers::{create_ram, delete_ram, get_ram, list_rams},
};

/// Cria e configura o roteador do Axum para os endpoints do catálogo de memórias RAM.
pub fn ram_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_ram))
        .route("/", get(list_rams))
        .route("/{id}", get(get_ram))
        .route("/{id}", axum::routing::delete(delete_ram))
}
