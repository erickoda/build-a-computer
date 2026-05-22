use utoipa::Modify;
use utoipa::OpenApi;
use utoipa::openapi::security::HttpAuthScheme;
use utoipa::openapi::security::HttpBuilder;
use utoipa::openapi::security::SecurityScheme;

use crate::application::commands::create_user::CreateUserCommand;
use crate::application::outputs::user::UserOutput;
use crate::infrastructure::web::controller::auth;
use crate::infrastructure::web::controller::user;

#[derive(OpenApi)]
#[openapi(
    paths(
        user::create_user,
        user::get_user,
        user::get_users,
        user::delete_user,
        auth::auth
    ),
    components(
        schemas(CreateUserCommand, UserOutput)
    ),
    tags(
        (name = "Users", description = "User manager endpoints")
    )
    ,
    modifiers(&SecurityAddon)
)]
pub struct ApiDoc;

pub struct SecurityAddon;

impl Modify for SecurityAddon {
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
