#[derive(Debug, PartialEq, Clone)]
pub struct HashedPassword(String);

impl HashedPassword {
    pub fn from_hash(hashed_password: String) -> Self {
        Self(hashed_password)
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}
