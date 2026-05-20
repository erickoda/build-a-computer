use serde::Deserialize;

#[derive(Deserialize)]
pub struct AuthCommand {
    email: String,
    password: String,
}

impl AuthCommand {
    pub fn new(email: String, password: String) -> Self {
        Self { email, password }
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
    pub fn test_auth_command_getters() {
        let email: &str = "user@email.com";
        let password: &str = "Senha123!";
        let command = AuthCommand {
            email: email.into(),
            password: password.into(),
        };

        assert_eq!("user@email.com", command.get_email());
        assert_eq!("Senha123!", command.get_password());
    }
}
