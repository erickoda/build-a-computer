use serde::Serialize;
use utoipa::ToSchema;

#[derive(Serialize, Debug, ToSchema)]
pub struct AuthResponseDto {
    token: String,
}

impl AuthResponseDto {
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
        let auth_output = AuthResponseDto::new(token.into());

        assert_eq!(token, auth_output.token);
    }
}
