use serde::Deserialize;

#[derive(Deserialize)]
pub struct AuthCommand {
    email: String,
    password: String,
}

impl AuthCommand {
    pub fn get_email(&self) -> &str {
        &self.email
    }

    pub fn get_password(&self) -> &str {
        &self.password
    }
}
