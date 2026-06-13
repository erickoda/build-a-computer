use axum::{
    Router,
    routing::{delete, get, patch, post},
};

use crate::{
    AppState,
    modules::users::handlers::{create_user, delete_user, get_user, get_users, update_user},
};

/// Configura e agrupa as rotas RESTful relacionadas aos usuários.
///
/// Este router mapeia as requisições HTTP para os seus respectivos
/// `handlers`, injetando o estado global `AppState`.
///
/// # Endpoints
///
/// * `POST /` - Cria um novo usuário.
/// * `GET /` - Lista todos os usuários.
/// * `GET /{id}` - Retorna os detalhes de um usuário específico.
/// * `PATCH /{id}` - Atualiza as informações de um usuário.
/// * `DELETE /{id}` - Soft delete de um usuário do sistema.
pub fn user_routes() -> Router<AppState> {
    Router::new()
        .route("/", post(create_user))
        .route("/{id}", get(get_user))
        .route("/", get(get_users))
        .route("/{id}", delete(delete_user))
        .route("/{id}", patch(update_user))
}
