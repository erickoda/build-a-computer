pub struct SignUpCommand {
    username: String,
    email: String,
    password: String,
}

impl SignUpCommand {
    pub fn new(username: String, email: String, password: String) -> Self {
        Self {
            username,
            email,
            password,
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
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    pub fn test_user_request_command_creation() {
        let username: String = String::from("José da Silva");
        let email: String = String::from("usurioa@email.com");
        let password: String = String::from("12345678");
        let command: SignUpCommand = SignUpCommand {
            username: username.clone(),
            email: email.clone(),
            password: password.clone(),
        };

        assert_eq!(username, command.get_username());
        assert_eq!(email, command.get_email());
        assert_eq!(password, command.get_password());
    }
}
