use actix_web::{FromRequest, HttpRequest, dev::Payload, error::ErrorUnauthorized};
use std::future::{Ready, ready};
use uuid::Uuid;

use crate::application::ports::token_generator::TokenGenerator;
use crate::domain::value_objects::role::Role;
use crate::infrastructure::security::jwt_generator::JwtGenerator;

#[derive(Debug)]
pub struct AuthenticatedUser {
    pub id: Uuid,
    pub role: Role,
}

impl FromRequest for AuthenticatedUser {
    type Error = actix_web::Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        let auth_header = match req.headers().get("Authorization") {
            Some(header) => header,
            None => return ready(Err(ErrorUnauthorized("Missing Authorization header"))),
        };

        let auth_str = match auth_header.to_str() {
            Ok(s) if s.starts_with("Bearer ") => s.trim_start_matches("Bearer "),
            _ => {
                return ready(Err(ErrorUnauthorized(
                    "Invalid Authorization header format",
                )));
            }
        };

        let jwt_generator = match req.app_data::<actix_web::web::Data<JwtGenerator>>() {
            Some(ge) => ge,
            None => {
                return ready(Err(actix_web::error::ErrorInternalServerError(
                    "JwtGenerator not configured",
                )));
            }
        };

        match jwt_generator.verify_token(auth_str) {
            Ok(claims) => ready(Ok(AuthenticatedUser {
                id: claims.get_sub(),
                role: claims.get_role(),
            })),
            Err(_) => ready(Err(ErrorUnauthorized("Invalid or expired token"))),
        }
    }
}
