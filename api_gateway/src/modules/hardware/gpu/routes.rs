use axum::{
    Router,
    routing::{get, patch, post},
};

use crate::{
    AppState,
    modules::hardware::gpu::handlers::{create_gpu, delete_gpu, get_gpu, list_gpus, update_gpu},
};

/// Cria e configura o roteador do Axum para os endpoints do catálogo de GPUs.
pub fn gpu_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_gpu))
        .route("/", get(list_gpus))
        .route("/{id}", get(get_gpu))
        .route("/{id}", patch(update_gpu))
        .route("/{id}", axum::routing::delete(delete_gpu))
}
