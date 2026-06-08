use axum::{Router, routing::post};

use crate::{
    AppState,
    modules::auth::handlers::{forgot_password, reset_password, sign_in, sign_up},
};

pub fn auth_routes() -> Router<AppState> {
    Router::new()
        .route("/sign-in", post(sign_in))
        .route("/sign-up", post(sign_up))
        .route("/forgot-password", post(forgot_password))
        .route("/reset-password", post(reset_password))
}
