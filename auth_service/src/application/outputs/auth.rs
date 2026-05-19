use serde::Serialize;

#[derive(Serialize)]
pub struct AuthOutput {
    token: String,
}

impl AuthOutput {
    pub fn new(token: String) -> Self {
        Self { token }
    }
}
