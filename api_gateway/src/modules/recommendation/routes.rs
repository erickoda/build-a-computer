use axum::{Router, routing::get};

use crate::{AppState, modules::recommendation::handlers::get_recommendation};

/// Cria e configura o roteador do Axum para os endpoints de recomendação.
///
/// Este método associa os caminhos de URL aos seus respectivos handlers
/// e define o estado compartilhado da aplicação ([`AppState`]) para injeção de dependências.
pub fn recommendation_routes() -> Router<AppState> {
    Router::new().route("/", get(get_recommendation))
}
