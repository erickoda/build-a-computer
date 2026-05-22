use actix_web::{web, HttpResponse};

use crate::{
    application::{commands::auth::AuthCommand, outputs::auth::AuthOutput},
    infrastructure::AppAuthService,
};

#[utoipa::path(
    post,
    path = "/api/v1/auth",
    request_body = AuthCommand,
    responses(
        (status = 200, description = "Successfully authenticate user", body = AuthOutput),
        (status = 400, description = "Invalid request data")
    ),
    tag = "Auth"
)]
pub async fn auth(
    json_command: web::Json<AuthCommand>,
    service: web::Data<AppAuthService>,
) -> Result<HttpResponse, actix_web::Error> {
    let command: AuthCommand = json_command.into_inner();

    Ok(HttpResponse::Ok().json(service.authenticate(command).await?))
}
