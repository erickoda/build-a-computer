use crate::{
    application::use_cases::{auth::AuthUseCase, user::UserUseCase},
    infrastructure::{
        email::gmail_sender::GmailSender,
        otp::in_memory::InMemoryOtpStore,
        persistence::sqlx_user_repository::SqlxUserRepository,
        security::{argo2_cryptography::Argo2Hasher, jwt_generator::JwtGenerator},
    },
};

pub mod cli;
pub mod email;
pub mod grpc;
pub mod otp;
pub mod persistence;
pub mod security;

pub type AppUserUseCase = UserUseCase<SqlxUserRepository, Argo2Hasher>;
pub type AppAuthUseCase =
    AuthUseCase<SqlxUserRepository, JwtGenerator, Argo2Hasher, GmailSender, InMemoryOtpStore>;
