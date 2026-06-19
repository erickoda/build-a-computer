use utoipa::{
    Modify, OpenApi,
    openapi::security::{HttpAuthScheme, HttpBuilder, SecurityScheme},
};

use crate::errors::AppError;

/// Addon para injeção global de segurança na especificação OpenAPI.
struct SecurityAddon;

impl Modify for SecurityAddon {
    /// Injeta o esquema de autenticação Bearer JWT nos componentes do OpenAPI.
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        let components = openapi.components.get_or_insert_with(Default::default);
        components.add_security_scheme(
            "bearer_auth",
            SecurityScheme::Http(
                HttpBuilder::new()
                    .scheme(HttpAuthScheme::Bearer)
                    .bearer_format("JWT")
                    .build(),
            ),
        )
    }
}

/// Estrutura principal geradora do OpenAPI.
///
/// Agrupa todos os esquemas de erro, rotas e modificadores de segurança da aplicação.
#[derive(OpenApi)]
#[openapi(
    components(
        schemas(
            AppError,
        )
    ),
    modifiers(&SecurityAddon)
)]
pub struct ApiDoc;
