use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
pub struct ResetPasswordDto {
    email: String,
    otp: String,
    #[serde(rename = "newPassword")]
    new_password: String,
}

impl ResetPasswordDto {
    pub fn get_email(&self) -> &str {
        &self.email
    }

    pub fn get_otp(&self) -> &str {
        &self.otp
    }

    pub fn get_new_password(&self) -> &str {
        &self.new_password
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    pub fn test_auth_request_dto_getters() {
        let email: &str = "user@email.com";
        let otp: &str = "123456";
        let new_password: &str = "AlgumaSenha123#";

        let command = ResetPasswordDto {
            email: email.into(),
            otp: otp.into(),
            new_password: new_password.into(),
        };

        assert_eq!("user@email.com", command.get_email());
        assert_eq!("123456", command.get_otp());
        assert_eq!("AlgumaSenha123#", command.get_new_password());
    }
}
