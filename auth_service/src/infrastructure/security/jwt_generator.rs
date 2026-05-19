use jsonwebtoken::{
    Algorithm, DecodingKey, EncodingKey, Header, Validation, decode, encode, errors::ErrorKind,
};

use crate::{
    application::ports::token_generator::{Claims, TokenError, TokenGenerator},
    domain::entities::user::UserEntity,
};

#[derive(Clone)]
pub struct JwtGenerator {
    secret_key: String,
    expiration_seconds: u64,
}

impl JwtGenerator {
    pub fn new(secret_key: String, expiration_seconds: u64) -> Self {
        Self {
            secret_key,
            expiration_seconds,
        }
    }
}

impl TokenGenerator for JwtGenerator {
    fn generate_token(&self, user_entity: &UserEntity) -> Result<String, TokenError> {
        let header: Header = Header::default();
        let claims: Claims = Claims::new(user_entity, self.expiration_seconds);
        let key: EncodingKey = EncodingKey::from_secret(self.secret_key.as_ref());

        let token: String = encode(&header, &claims, &key).map_err(|jwt_error| {
            println!("[JWT Infra]: Failed to code token: {}", jwt_error);
            TokenError::GenerationFailed
        })?;

        Ok(token)
    }

    fn verify_token(&self, token: &str) -> Result<Claims, TokenError> {
        let key = DecodingKey::from_secret(self.secret_key.as_bytes());
        let validation = Validation::new(Algorithm::HS256);

        Ok(decode::<Claims>(token, &key, &validation)?.claims)
    }
}

impl From<jsonwebtoken::errors::Error> for TokenError {
    fn from(jsonwebtoken_error: jsonwebtoken::errors::Error) -> Self {
        match jsonwebtoken_error.kind() {
            ErrorKind::ExpiredSignature => TokenError::Expired,

            ErrorKind::InvalidToken
            | ErrorKind::InvalidSignature
            | ErrorKind::InvalidEcdsaKey
            | ErrorKind::InvalidIssuer
            | ErrorKind::InvalidAudience
            | ErrorKind::InvalidSubject => TokenError::InvalidToken,

            _ => {
                println!(
                    "[JWT Infra]: Falha interna inesperada: {:?}",
                    jsonwebtoken_error
                );
                TokenError::InternalError(jsonwebtoken_error.to_string())
            }
        }
    }
}
