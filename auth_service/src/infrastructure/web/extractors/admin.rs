use std::future::{Ready, ready};

use actix_web::{FromRequest, error::ErrorForbidden};

use crate::{
    domain::value_objects::role::Role,
    infrastructure::web::extractors::authenticated::AuthenticatedUser,
};

pub struct AdminUser(AuthenticatedUser);

impl FromRequest for AdminUser {
    type Error = actix_web::Error;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        let auth_result = AuthenticatedUser::from_request(req, payload).into_inner();

        match auth_result {
            Ok(user) => {
                if user.role == Role::Admin {
                    ready(Ok(AdminUser(user)))
                } else {
                    ready(Err(ErrorForbidden(
                        "[Access Denied]: Requires admin privilege",
                    )))
                }
            }
            Err(e) => ready(Err(e)),
        }
    }
}
