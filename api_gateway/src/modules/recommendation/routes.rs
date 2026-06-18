use axum::{Router, routing::get};

use crate::{AppState, modules::recommendation::handlers::get_recommendation};

pub fn recommendation_routes() -> Router<AppState> {
    Router::new().route("/", get(get_recommendation))
}
