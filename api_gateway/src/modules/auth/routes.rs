use axum::{routing::post, Router};

use crate::{modules::auth::handlers::authenticate, AppState};

pub fn auth_routes() -> Router<AppState> {
    Router::new().route("/", post(authenticate))
}
