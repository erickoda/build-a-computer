use serde::Deserialize;

use crate::domain::value_objects::role::Role;

#[derive(Deserialize)]
pub struct CreateUserCommand {
    username: String,
    email: String,
    password: String,
    role: Role,
}

impl CreateUserCommand {
    pub fn new(username: String, email: String, password: String, role: Role) -> Self {
        Self {
            username,
            email,
            password,
            role,
        }
    }

    pub fn get_username(&self) -> &str {
        &self.username
    }

    pub fn get_email(&self) -> &str {
        &self.email
    }

    pub fn get_password(&self) -> &str {
        &self.password
    }

    pub fn get_role(&self) -> Role {
        self.role
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    pub fn test_user_request_command_creation() {
        let username: String = String::from("José da Silva");
        let email: String = String::from("usurioa@email.com");
        let password: String = String::from("12345678");
        let role: Role = Role::Admin;
        let command: CreateUserCommand = CreateUserCommand {
            username: username.clone(),
            email: email.clone(),
            password: password.clone(),
            role: role.clone(),
        };

        assert_eq!(username, command.get_username());
        assert_eq!(email, command.get_email());
        assert_eq!(password, command.get_password());
        assert_eq!(role, command.get_role());
    }
}
