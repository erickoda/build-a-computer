use axum::{
    Router,
    routing::{delete, get, patch, post},
};

use crate::{
    AppState,
    modules::users::handlers::{create_user, delete_user, get_user, get_users, update_user},
};

pub fn user_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_user))
        .route("/{id}", get(get_user))
        .route("/", get(get_users))
        .route("/{id}", delete(delete_user))
        .route("/{id}", patch(update_user))
}
