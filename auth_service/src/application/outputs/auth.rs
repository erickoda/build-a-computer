use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct AuthOutput {
    token: String,
}

impl AuthOutput {
    pub fn new(token: String) -> Self {
        Self { token }
    }

    #[cfg(test)]
    pub fn get_token(&self) -> &str {
        &self.token
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    pub fn test_auth_output_creation() {
        let token: &str = "MyToken";
        let auth_output = AuthOutput::new(token.into());

        assert_eq!(token, auth_output.token);
    }
}
