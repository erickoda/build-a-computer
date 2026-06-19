pub struct ResetPasswordCommand {
    email: String,
    otp: String,
    new_password: String,
}

impl ResetPasswordCommand {
    pub fn new(email: String, otp: String, new_password: String) -> Self {
        Self {
            email,
            otp,
            new_password,
        }
    }

    pub fn get_email(&self) -> &str {
        &self.email
    }

    pub fn get_new_password(&self) -> &str {
        &self.new_password
    }

    pub fn get_otp(&self) -> &str {
        &self.otp
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    pub fn test_user_request_command_creation() {
        let email = String::from("usurioa@email.com");
        let otp = String::from("123456");
        let new_password = String::from("12345678");

        let command = ResetPasswordCommand {
            email: email.clone(),
            otp: otp.clone(),
            new_password: new_password.clone(),
        };

        assert_eq!(&email, command.get_email());
        assert_eq!(&otp, command.get_otp());
        assert_eq!(&new_password, command.get_new_password());
    }
}
