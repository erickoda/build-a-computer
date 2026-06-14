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

/// Adaptador de infraestrutura para gerenciamento de JSON Web Tokens (JWT).
///
/// Implementa a porta [`TokenGenerator`] utilizando criptografia HMAC
/// SHA-256 / HS256 para assinar e validar as sessões dos usuários.
#[derive(Clone)]
pub struct JwtGenerator {
    secret_key: String,
    expiration_seconds: u64,
}

impl JwtGenerator {
    /// Inicializa o gerador de JWTs com a chave secreta e o tempo de vida (TTL).
    pub fn new(secret_key: String, expiration_seconds: u64) -> Self {
        Self {
            secret_key,
            expiration_seconds,
        }
    }
}

impl TokenGenerator for JwtGenerator {
    /// Gera um token JWT assinado (HS256) contendo os dados essenciais do usuário.
    fn generate_token(&self, user_entity: &UserEntity) -> Result<String, TokenError> {
        let header: Header = Header::default();
        let claims: Claims = Claims::new(user_entity, self.expiration_seconds);
        let key: EncodingKey = EncodingKey::from_secret(self.secret_key.as_ref());

        let token: String = encode(&header, &claims, &key).map_err(|jwt_error| {
            tracing::error!("[JWT Infra]: Failed to code token: {}", jwt_error);
            TokenError::GenerationFailed
        })?;

        Ok(token)
    }

    /// Descompacta e valida a assinatura e expiração do JWT.
    fn verify_token(&self, token: &str) -> Result<TokenPayload, TokenError> {
        let key = DecodingKey::from_secret(self.secret_key.as_bytes());
        let validation = Validation::new(Algorithm::HS256);
        let claims = decode::<Claims>(token, &key, &validation)?.claims;
        let token_payload = claims.into();

        Ok(token_payload)
    }
}

/// Traduz os erros específicos da crate [`jsonwebtoken`] para o enum de erros de domínio.
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

/// Representa a estrutura interna (Payload) do token JWT.
#[derive(Serialize, Deserialize)]
struct Claims {
    /// Identificador do sujeito (Subject) - UUID do Usuário.
    sub: Uuid,
    username: String,
    email: String,
    role: Role,
    /// Data de expiração (Expiration Time) em Segundos desde o Unix Epoch.
    exp: u64,
    /// Data de emissão (Issued At) em Segundos desde o Unix Epoch.
    iat: u64,
}

impl Claims {
    /// Constrói um novo conjunto de claims mapeando os dados da Entidade do Usuário
    /// e calculando as datas de emissão e expiração de forma automática.
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

    /// Retorna o identificador único do usuário (UUID) armazenado no token.
    pub fn get_sub(&self) -> Uuid {
        self.sub
    }

    /// Retorna uma referência ao nome de usuário contido no token.
    pub fn get_username(&self) -> &str {
        &self.username
    }

    /// Retorna uma referência ao e-mail do usuário contido no token.
    pub fn get_email(&self) -> &str {
        &self.email
    }

    /// Retorna o nível de acesso (Role) do usuário embutido no token.
    pub fn get_role(&self) -> Role {
        self.role
    }
}

/// Converte a estrutura interna [`Claims`] para a estrutura pública [`TokenPayload`]
/// esperada pela camada de Aplicação.
impl Into<TokenPayload> for Claims {
    fn into(self) -> TokenPayload {
        TokenPayload::new(
            self.get_sub(),
            self.get_username().to_string(),
            self.get_email().to_string(),
            self.get_role(),
        )
    }
}
