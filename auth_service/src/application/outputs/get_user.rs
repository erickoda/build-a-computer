use serde::Serialize;
use uuid::Uuid;

use crate::domain::{
    entities::user::UserEntity,
    value_objects::{role::Role, status::Status},
};

#[derive(Serialize)]
pub struct GetUserResponseOutput {
    id: Uuid,
    username: String,
    email: String,
    role: Role,
    status: Status,
}

impl From<UserEntity> for GetUserResponseOutput {
    fn from(user_entity: UserEntity) -> Self {
        Self {
            id: user_entity.get_id(),
            username: user_entity.get_username().into(),
            email: user_entity.get_email().into(),
            role: *user_entity.get_role(),
            status: *user_entity.get_status(),
        }
    }
}
