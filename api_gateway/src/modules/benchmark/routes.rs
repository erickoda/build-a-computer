use axum::{
    Router,
    routing::{get, post},
};

use crate::{
    AppState,
    modules::benchmark::handlers::{
        create_benchmark, delete_benchmark, filter_benchmarks, get_benchmark,
        get_benchmarks_of_user, list_benchmarks, list_benchmarks_by_title,
    },
};

/// Cria e configura o roteador do Axum para os endpoints de benchmark.
pub fn benchmark_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_benchmark))
        .route("/", get(list_benchmarks))
        .route("/filter", post(filter_benchmarks))
        .route("/search", get(list_benchmarks_by_title))
        .route("/users/{user_id}", get(get_benchmarks_of_user))
        .route("/{id}", get(get_benchmark))
        .route("/{id}", axum::routing::delete(delete_benchmark))
}
