use actix_web::{HttpResponse, web};

use crate::{
    application::{commands::{sign_in::SignInCommand, sign_up::SignUpCommand}, outputs::auth::AuthOutput},
    infrastructure::AppAuthUseCase,
};

#[utoipa::path(
    post,
    path = "/api/v1/authenticate",
    request_body = SignInCommand,
    responses(
        (status = 200, description = "Successfully authenticate user", body = AuthOutput),
        (status = 400, description = "Invalid request data")
    ),
    tag = "Auth"
)]
pub async fn sign_in(
    json_command: web::Json<SignInCommand>,
    service: web::Data<AppAuthUseCase>,
) -> Result<HttpResponse, actix_web::Error> {
    let command: SignInCommand = json_command.into_inner();

    Ok(HttpResponse::Ok().json(service.sign_in(command).await?))
}

#[utoipa::path(
    post,
    path = "/api/v1/authenticate",
    request_body = SignInCommand,
    responses(
        (status = 200, description = "Successfully authenticate user", body = AuthOutput),
        (status = 400, description = "Invalid request data")
    ),
    tag = "Auth"
)]
pub async fn sign_up(
    json_command: web::Json<SignUpCommand>,
    service: web::Data<AppAuthUseCase>,
) -> Result<HttpResponse, actix_web::Error> {
    let command: SignUpCommand = json_command.into_inner();

    Ok(HttpResponse::Ok().json(service.sign_up(command).await?))
}

