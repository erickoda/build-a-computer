#[derive(Debug)]
pub enum UserEntityError {
    InvalidUsername(String),
    InvalidEmail(String),
    InvalidPassword(String),
}

impl UserEntityError {
    pub fn get_text(&self) -> String {
        match self {
            Self::InvalidUsername(error_message) => error_message.to_string(),
            Self::InvalidEmail(error_message) => error_message.to_string(),
            Self::InvalidPassword(error_message) => error_message.to_string(),
        }
    }
}
