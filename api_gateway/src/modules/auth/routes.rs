use axum::{routing::post, Router};

use crate::{AppState, modules::auth::handlers::{sign_in, sign_up}};

pub fn auth_routes() -> Router<AppState> {
    Router::new()
        .route("/sign-in", post(sign_in))
        .route("/sign-up", post(sign_up))
}
