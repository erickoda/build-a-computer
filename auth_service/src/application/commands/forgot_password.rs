use serde::Deserialize;

#[derive(Deserialize)]
pub struct ForgotPasswordCommand {
    email: String,
}

impl ForgotPasswordCommand {
    pub fn new(email: String) -> Self {
        Self { email }
    }

    pub fn get_email(&self) -> &str {
        &self.email
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    pub fn test_user_request_command_creation() {
        let email = String::from("usurioa@email.com");

        let command = ForgotPasswordCommand {
            email: email.clone(),
        };

        assert_eq!(&email, command.get_email());
    }
}
