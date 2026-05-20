use std::time::{SystemTime, UNIX_EPOCH};

use jsonwebtoken::{
    Algorithm, DecodingKey, EncodingKey, Header, Validation, decode, encode, errors::ErrorKind,
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{
    application::ports::token_generator::{TokenError, TokenGenerator, TokenPayload},
    domain::{entities::user::UserEntity, value_objects::role::Role},
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

    fn verify_token(&self, token: &str) -> Result<TokenPayload, TokenError> {
        let key = DecodingKey::from_secret(self.secret_key.as_bytes());
        let validation = Validation::new(Algorithm::HS256);
        let claims = decode::<Claims>(token, &key, &validation)?.claims;
        let token_payload = claims.into();

        Ok(token_payload)
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

#[derive(Serialize, Deserialize)]
struct Claims {
    sub: Uuid,
    username: String,
    email: String,
    role: Role,
    exp: u64,
    iat: u64,
}

impl Claims {
    pub fn new(user_entity: &UserEntity, expiration_seconds: u64) -> Self {
        let now: u64 = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("Time went backwards")
            .as_secs();

        let exp: u64 = now + expiration_seconds;

        Self {
            sub: user_entity.get_id(),
            username: user_entity.get_username().into(),
            email: user_entity.get_email().into(),
            role: *user_entity.get_role(),
            exp,
            iat: now,
        }
    }

    pub fn get_sub(&self) -> Uuid {
        self.sub
    }

    pub fn get_username(&self) -> &str {
        &self.username
    }

    pub fn get_email(&self) -> &str {
        &self.email
    }

    pub fn get_role(&self) -> Role {
        self.role
    }

    pub fn get_exp(&self) -> u64 {
        self.exp
    }

    pub fn get_iat(&self) -> u64 {
        self.iat
    }
}

impl Into<TokenPayload> for Claims {
    fn into(self) -> TokenPayload {
        TokenPayload {
            id: self.get_sub(),
            username: self.get_username().to_string(),
            email: self.get_email().to_string(),
            role: self.get_role(),
        }
    }
}
