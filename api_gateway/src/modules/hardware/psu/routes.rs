use axum::{
    Router,
    routing::{get, patch, post},
};

use crate::{
    AppState,
    modules::hardware::psu::handlers::{create_psu, delete_psu, get_psu, list_psus, update_psu},
};

/// Cria e configura o roteador do Axum para os endpoints do catálogo de fontes de alimentação.
pub fn psu_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_psu))
        .route("/", get(list_psus))
        .route("/{id}", get(get_psu))
        .route("/{id}", patch(update_psu))
        .route("/{id}", axum::routing::delete(delete_psu))
}
