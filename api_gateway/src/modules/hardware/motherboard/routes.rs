use axum::{
    Router,
    routing::{get, patch, post},
};

use crate::{
    AppState,
    modules::hardware::motherboard::handlers::{
        create_motherboard, delete_motherboard, get_motherboard, list_motherboards, update_motherboard,
    },
};

/// Cria e configura o roteador do Axum para os endpoints do catálogo de placas-mãe.
pub fn motherboard_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_motherboard))
        .route("/", get(list_motherboards))
        .route("/{id}", get(get_motherboard))
        .route("/{id}", patch(update_motherboard))
        .route("/{id}", axum::routing::delete(delete_motherboard))
}
