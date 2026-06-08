use std::str::FromStr;

use tonic::{Request, Status};
use uuid::Uuid;

use crate::domain::value_objects::role::Role;

#[derive(Clone)]
pub struct UserContext {
    pub user_id: Uuid,
    pub user_role: Role,
}

pub fn auth_interceptor(mut req: Request<()>) -> Result<Request<()>, Status> {
    let id_str = req
        .metadata()
        .get("x-user-id")
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| Status::unauthenticated("Access Denied: did not receive x-user-id"))?;

    let role_str = req
        .metadata()
        .get("x-user-role")
        .and_then(|v| v.to_str().ok())
        .ok_or_else(|| Status::unauthenticated("Access Denied: did not receive x-user-role"))?;

    let id = Uuid::from_str(id_str)
        .map_err(|_| Status::unauthenticated("Access Denied: invalid x-user-id"))?;

    let role = Role::from_str(role_str)
        .map_err(|_| Status::unauthenticated("Access Denied: invalid x-user-role"))?;

    req.extensions_mut().insert(UserContext {
        user_id: id,
        user_role: role,
    });

    Ok(req)
}
