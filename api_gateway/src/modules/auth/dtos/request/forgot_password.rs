use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
pub struct ForgotPasswordDto {
    email: String,
}

impl ForgotPasswordDto {
    pub fn get_email(&self) -> &str {
        &self.email
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    pub fn test_auth_request_dto_getters() {
        let email: &str = "user@email.com";
        let command = ForgotPasswordDto {
            email: email.into(),
        };

        assert_eq!("user@email.com", command.get_email());
    }
}
