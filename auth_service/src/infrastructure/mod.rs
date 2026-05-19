use crate::{
    application::use_cases::{auth_service::AuthService, user_service::UserService},
    infrastructure::{
        persistence::sqlx_user_repository::SqlxUserRepository,
        security::{argo2_cryptography::Argo2Hasher, jwt_generator::JwtGenerator},
    },
};

pub mod cli;
pub mod persistence;
pub mod security;
pub mod web;

pub type AppUserService = UserService<SqlxUserRepository, Argo2Hasher>;
pub type AppAuthService = AuthService<SqlxUserRepository, JwtGenerator, Argo2Hasher>;
