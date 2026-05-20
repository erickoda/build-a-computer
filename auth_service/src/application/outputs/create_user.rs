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

#[cfg(test)]
mod test {
    use crate::domain::value_objects::{
        email::Email, hashed_password::HashedPassword, role::Role, username::Username,
    };

    use super::*;

    #[test]
    pub fn test_from_user_entity_for_create_user_output() {
        let username = Username::try_from("Username".to_string()).unwrap();
        let email = Email::try_from("user@email.com".to_string()).unwrap();
        let password: HashedPassword = HashedPassword::from_hash("hashed_password".to_string());
        let role: Role = Role::Supervisor;

        let user_entity: UserEntity = UserEntity::new(username, email, password, role);
        let id: Uuid = user_entity.get_id();

        let create_user_output: CreateUserOutput = CreateUserOutput::from(user_entity);

        assert_eq!(
            "Username", create_user_output.username,
            "Expected username to be 'Username', but found: {}",
            create_user_output.username
        );
        assert_eq!(
            "user@email.com", create_user_output.email,
            "Expected email to be user@email.com, but found: {}",
            create_user_output.email
        );
        assert_eq!(id, create_user_output.id);
    }
}
