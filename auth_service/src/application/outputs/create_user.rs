use serde::Serialize;
use uuid::Uuid;

use crate::domain::entities::user::UserEntity;

#[derive(Serialize)]
pub struct CreateUserOutput {
    id: Uuid,
    username: String,
    email: String,
}

impl From<UserEntity> for CreateUserOutput {
    fn from(user_entity: UserEntity) -> Self {
        Self {
            id: user_entity.get_id(),
            username: user_entity.get_username().into(),
            email: user_entity.get_email().into(),
        }
    }
}
