use serde::Deserialize;
use utoipa::ToSchema;

use crate::modules::users::dtos::{user_role::UserRole, user_status::UserStatus};

#[derive(Deserialize, ToSchema)]
pub struct UpdateUserDto {
    username: Option<String>,
    email: Option<String>,
    password: Option<String>,
    role: Option<UserRole>,
    status: Option<UserStatus>,
}

impl UpdateUserDto {
    pub fn get_username(&self) -> &Option<String> {
        &self.username
    }

    pub fn get_email(&self) -> &Option<String> {
        &self.email
    }

    pub fn get_password(&self) -> &Option<String> {
        &self.password
    }

    pub fn get_role(&self) -> &Option<UserRole> {
        &self.role
    }

    pub fn get_status(&self) -> &Option<UserStatus> {
        &self.status
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
        let role: UserRole = UserRole::Admin;
        let status: UserStatus = UserStatus::Active;

        let command: UpdateUserDto = UpdateUserDto {
            username: Some(username.clone()),
            email: Some(email.clone()),
            password: Some(password.clone()),
            role: Some(role),
            status: Some(status),
        };

        assert_eq!(username, command.get_username().clone().unwrap());
        assert_eq!(email, command.get_email().clone().unwrap());
        assert_eq!(password, command.get_password().clone().unwrap());
        assert_eq!(role, command.get_role().unwrap());
        assert_eq!(status, command.get_status().unwrap());
    }
}
