use actix_web::{HttpResponse, web};

use crate::{application::commands::auth::AuthCommand, infrastructure::AppAuthService};

pub async fn auth(
    json_command: web::Json<AuthCommand>,
    service: web::Data<AppAuthService>,
) -> Result<HttpResponse, actix_web::Error> {
    let command: AuthCommand = json_command.into_inner();

    Ok(HttpResponse::Ok().json(service.authenticate(command).await?))
}
