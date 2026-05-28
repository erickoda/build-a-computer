use actix_web::{HttpResponse, web};
use uuid::Uuid;

use crate::{
    application::{commands::create_user::CreateUserCommand, outputs::user::UserOutput},
    infrastructure::{AppUserUseCase, web::extractors::authenticated::AuthenticatedUser},
};

#[utoipa::path(
    post,
    path = "/api/v1/user",
    request_body = CreateUserCommand,
    responses(
        (status = 201, description = "Successfully created user", body = UserOutput),
        (status = 400, description = "Invalid request data"),
        (status = 409, description = "Email already in use"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Users"
)]
pub async fn create_user(
    json_command: web::Json<CreateUserCommand>,
    service: web::Data<AppUserUseCase>,
    _: AuthenticatedUser,
) -> Result<HttpResponse, actix_web::Error> {
    let command: CreateUserCommand = json_command.0;

    Ok(HttpResponse::Created().json(UserOutput::from(service.create_user(command).await?)))
}

#[utoipa::path(
    get,
    path = "/api/v1/user/{id}",
    responses(
        (status = 201, description = "Successfully got user", body = UserOutput),
        (status = 404, description = "Not Found")
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Users"
)]
pub async fn get_user(
    path: web::Path<Uuid>,
    service: web::Data<AppUserUseCase>,
    _: AuthenticatedUser,
) -> Result<HttpResponse, actix_web::Error> {
    let id: Uuid = path.into_inner();

    Ok(HttpResponse::Ok().json(UserOutput::from(service.get_user(id).await?)))
}

#[utoipa::path(
    get,
    path = "/api/v1/user",
    responses(
        (status = 200, description = "Successfully got users", body = [UserOutput]),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Users"
)]
pub async fn get_users(
    service: web::Data<AppUserUseCase>,
    _: AuthenticatedUser,
) -> Result<HttpResponse, actix_web::Error> {
    Ok(HttpResponse::Ok().json(
        service
            .get_users()
            .await?
            .into_iter()
            .map(UserOutput::from)
            .collect::<Vec<UserOutput>>(),
    ))
}

#[utoipa::path(
    delete,
    path = "/api/v1/user/{id}",
    responses(
        (status = 204, description = "Successfully deleted user"),
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Users"
)]
pub async fn delete_user(
    path: web::Path<Uuid>,
    service: web::Data<AppUserUseCase>,
    requester_user: AuthenticatedUser,
) -> Result<HttpResponse, actix_web::Error> {
    let delete_user_id: Uuid = path.into_inner();

    service
        .delete_user(delete_user_id, requester_user.id, requester_user.role)
        .await?;

    Ok(HttpResponse::NoContent().finish())
}
