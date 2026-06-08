use serde::Deserialize;
use uuid::Uuid;

use crate::domain::value_objects::{role::Role, status::Status};

#[derive(Deserialize)]
pub struct UpdateUserCommand {
    id: Uuid,
    username: Option<String>,
    email: Option<String>,
    password: Option<String>,
    role: Option<Role>,
    status: Option<Status>,
}

impl UpdateUserCommand {
    pub fn new(
        id: Uuid,
        username: Option<String>,
        email: Option<String>,
        password: Option<String>,
        role: Option<Role>,
        status: Option<Status>,
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

    pub fn get_id(&self) -> Uuid {
        self.id
    }

    pub fn get_username(&self) -> &Option<String> {
        &self.username
    }

    pub fn get_email(&self) -> &Option<String> {
        &self.email
    }

    pub fn get_password(&self) -> &Option<String> {
        &self.password
    }

    pub fn get_role(&self) -> &Option<Role> {
        &self.role
    }

    pub fn get_status(&self) -> &Option<Status> {
        &self.status
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    pub fn test_user_request_command_creation() {
        let id = Uuid::new_v4();
        let username: String = String::from("José da Silva");
        let email: String = String::from("usurioa@email.com");
        let password: String = String::from("12345678");
        let role: Role = Role::Admin;
        let status: Status = Status::Active;

        let command: UpdateUserCommand = UpdateUserCommand {
            id,
            username: Some(username.clone()),
            email: Some(email.clone()),
            password: Some(password.clone()),
            role: Some(role),
            status: Some(status),
        };

        assert_eq!(id, command.get_id());
        assert_eq!(username, command.get_username().clone().unwrap());
        assert_eq!(email, command.get_email().clone().unwrap());
        assert_eq!(password, command.get_password().clone().unwrap());
        assert_eq!(role, command.get_role().unwrap());
        assert_eq!(status, command.get_status().unwrap());
    }
}
