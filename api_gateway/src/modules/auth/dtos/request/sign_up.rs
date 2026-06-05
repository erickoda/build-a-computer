
use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
pub struct SignUpRequestDto {
    username: String,
    email: String,
    password: String,
}

impl SignUpRequestDto {
    pub fn get_username(&self) -> &str {
        &self.username
    }

    pub fn get_email(&self) -> &str {
        &self.email
    }

    pub fn get_password(&self) -> &str {
        &self.password
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    pub fn test_auth_request_dto_getters() {
        let username: &str = "User";
        let email: &str = "user@email.com";
        let password: &str = "Senha123!";

        let command = SignUpRequestDto {
            username: username.into(),
            email: email.into(),
            password: password.into(),
        };

        assert_eq!("user@email.com", command.get_email());
        assert_eq!("Senha123!", command.get_password());
        assert_eq!("User", command.get_username());
    }
}
