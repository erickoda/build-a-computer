use axum::{
    routing::{delete, get, post},
    Router,
};

use crate::{
    modules::users::handlers::{create_user, delete_user, get_user, get_users},
    AppState,
};

pub fn user_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_user))
        .route("/{id}", get(get_user))
        .route("/", get(get_users))
        .route("/{id}", delete(delete_user))
}
