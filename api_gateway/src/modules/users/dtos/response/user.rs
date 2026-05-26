use serde::Serialize;
use utoipa::ToSchema;
use uuid::Uuid;

use crate::modules::users::dtos::{user_role::UserRole, user_status::UserStatus};

#[derive(Serialize, ToSchema)]
pub struct UserDto {
    id: Uuid,
    username: String,
    email: String,
    role: UserRole,
    status: UserStatus,
}

impl UserDto {
    pub fn new(
        id: Uuid,
        username: String,
        email: String,
        role: UserRole,
        status: UserStatus,
    ) -> Self {
        Self {
            id,
            username,
            email,
            role,
            status,
        }
    }
}
