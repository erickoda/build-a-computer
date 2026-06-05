use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
pub struct SignInRequestDto {
    email: String,
    password: String,
}

impl SignInRequestDto {
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
        let email: &str = "user@email.com";
        let password: &str = "Senha123!";
        let command = SignInRequestDto {
            email: email.into(),
            password: password.into(),
        };

        assert_eq!("user@email.com", command.get_email());
        assert_eq!("Senha123!", command.get_password());
    }
}
