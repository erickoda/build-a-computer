use serde::Serialize;
use utoipa::ToSchema;

#[derive(Serialize, Debug, ToSchema)]
pub struct AuthResponse {
    token: String,
}

impl AuthResponse {
    pub fn new(token: String) -> Self {
        Self { token }
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    pub fn test_auth_output_creation() {
        let token: &str = "MyToken";
        let auth_output = AuthResponse::new(token.into());

        assert_eq!(token, auth_output.token);
    }
}
