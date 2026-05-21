use actix_web::{HttpResponse, web};
use uuid::Uuid;

use crate::{
    application::{commands::create_user::CreateUserCommand, outputs::user::UserOutput},
    infrastructure::{
        AppUserService,
        web::extractors::{admin::AdminUser, authenticated::AuthenticatedUser},
    },
};

pub async fn create_user(
    json_command: web::Json<CreateUserCommand>,
    service: web::Data<AppUserService>,
    _: AdminUser,
) -> Result<HttpResponse, actix_web::Error> {
    let command: CreateUserCommand = json_command.0;

    Ok(HttpResponse::Created().json(UserOutput::from(service.create_user(command).await?)))
}

pub async fn get_user(
    path: web::Path<Uuid>,
    service: web::Data<AppUserService>,
    _: AuthenticatedUser,
) -> Result<HttpResponse, actix_web::Error> {
    let id: Uuid = path.into_inner();

    Ok(HttpResponse::Ok().json(UserOutput::from(service.get_user(id).await?)))
}

pub async fn get_users(
    service: web::Data<AppUserService>,
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

pub async fn delete_user(
    path: web::Path<Uuid>,
    service: web::Data<AppUserService>,
    requester_user: AuthenticatedUser,
) -> Result<HttpResponse, actix_web::Error> {
    let delete_user_id: Uuid = path.into_inner();

    service
        .delete_user(delete_user_id, requester_user.id, requester_user.role)
        .await?;

    Ok(HttpResponse::NoContent().finish())
}
