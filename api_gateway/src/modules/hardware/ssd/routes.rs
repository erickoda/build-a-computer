use axum::{
    Router,
    routing::{get, post},
};

use crate::{
    AppState,
    modules::hardware::ssd::handlers::{create_ssd, delete_ssd, get_ssd, list_ssds},
};

/// Cria e configura o roteador do Axum para os endpoints do catálogo de SSDs.
pub fn ssd_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_ssd))
        .route("/", get(list_ssds))
        .route("/{id}", get(get_ssd))
        .route("/{id}", axum::routing::delete(delete_ssd))
}
