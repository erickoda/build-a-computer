use axum::{
    Router,
    routing::{get, post},
};

use crate::{
    AppState,
    modules::hardware::cpu::handlers::{create_cpu, delete_cpu, get_cpu, list_cpus},
};

/// Cria e configura o roteador do Axum para os endpoints do catálogo de CPUs.
pub fn cpu_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_cpu))
        .route("/", get(list_cpus))
        .route("/{id}", get(get_cpu))
        .route("/{id}", axum::routing::delete(delete_cpu))
}
