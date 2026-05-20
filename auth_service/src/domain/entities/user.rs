use uuid::Uuid;
use validator::Validate;

use crate::domain::value_objects::{
    email::Email, hashed_password::HashedPassword, role::Role, status::Status, username::Username,
};

#[derive(Clone, Validate, Debug)]
pub struct UserEntity {
    id: Uuid,
    username: Username,
    email: Email,
    password: HashedPassword,
    role: Role,
    status: Status,
}

impl UserEntity {
    pub fn new(username: Username, email: Email, password: HashedPassword, role: Role) -> Self {
        Self {
            id: Uuid::new_v4(),
            username,
            email,
            password,
            role,
            status: Status::Active,
        }
    }

    pub fn restore(
        id: Uuid,
        username: Username,
        email: Email,
        password: HashedPassword,
        role: Role,
        status: Status,
    ) -> Self {
        Self {
            id,
            username,
            email,
            password,
            role,
            status,
        }
    }

    pub fn get_username(&self) -> &Username {
        &self.username
    }

    pub fn get_email(&self) -> &Email {
        &self.email
    }

    pub fn get_password(&self) -> &HashedPassword {
        &self.password
    }

    pub fn get_id(&self) -> Uuid {
        self.id
    }

    pub fn get_role(&self) -> &Role {
        &self.role
    }

    pub fn get_status(&self) -> &Status {
        &self.status
    }
}

#[cfg(test)]
mod test {

    use super::*;
    use crate::domain::value_objects::plain_password::PlainPassword;

    #[test]
    pub fn test_user_entity_creation() {
        let username: Username = Username::try_from(String::from("John Robert")).unwrap();
        let email: Email = Email::try_from(String::from("john.robert@usp.br")).unwrap();

        let plain_password: PlainPassword =
            PlainPassword::try_from("johnrobert123!".to_string()).unwrap();
        let password: HashedPassword =
            HashedPassword::from_hash(plain_password.as_str().to_string());

        let role: Role = Role::Admin;

        let user: UserEntity =
            UserEntity::new(username.clone(), email.clone(), password.clone(), role);

        assert_eq!(username, *user.get_username());
        assert_eq!(email, *user.get_email());
        assert_eq!(password, *user.get_password());
        assert_eq!(role, *user.get_role());
    }
}
