use actix_web::web;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

use crate::infrastructure::web::{
    controller::{
        auth::auth,
        user::{create_user, delete_user, get_user, get_users},
    },
    swagger::ApiDoc,
};

pub fn configure_routes(cfg: &mut web::ServiceConfig) {
    cfg.service(
        SwaggerUi::new("/swagger-ui/{_:.*}").url("/api-docs/openapi.json", ApiDoc::openapi()),
    );
    cfg.service(
        web::scope("/api/v1")
            .service(web::scope("/auth").route("", web::post().to(auth)))
            .service(
                web::scope("/user")
                    .route("", web::post().to(create_user))
                    .route("", web::get().to(get_users))
                    .route("/{id}", web::get().to(get_user))
                    .route("/{id}", web::delete().to(delete_user)),
            ),
    );
}
