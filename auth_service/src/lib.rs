pub mod auth_grpc {
    tonic::include_proto!("auth");
}

pub mod users_grpc {
    tonic::include_proto!("user");
}

pub mod application;
pub mod config;
pub mod domain;
pub mod infrastructure;
