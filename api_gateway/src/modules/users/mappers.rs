use crate::{
    errors::AppError,
    modules::users::dtos::{response::user::UserDto, user_role::UserRole, user_status::UserStatus},
    users_grpc,
};

impl From<UserRole> for users_grpc::Role {
    fn from(user_role: UserRole) -> Self {
        match user_role {
            UserRole::Admin => Self::Admin,
            UserRole::Supervisor => Self::Supervisor,
            UserRole::Common => Self::Common,
        }
    }
}

impl From<users_grpc::Status> for UserStatus {
    fn from(users_grpc_status: users_grpc::Status) -> Self {
        match users_grpc_status {
            users_grpc::Status::Active => Self::Active,
            users_grpc::Status::Inactive => Self::Inactive,
            users_grpc::Status::Banned => Self::Banned,
        }
    }
}

impl From<users_grpc::Role> for UserRole {
    fn from(users_grpc_role: users_grpc::Role) -> Self {
        match users_grpc_role {
            users_grpc::Role::Admin => Self::Admin,
            users_grpc::Role::Supervisor => Self::Supervisor,
            users_grpc::Role::Common => Self::Common,
        }
    }
}

impl TryFrom<users_grpc::User> for UserDto {
    type Error = AppError;

    fn try_from(user_grpc: users_grpc::User) -> Result<UserDto, AppError> {
        Ok(UserDto::new(
            uuid::Uuid::parse_str(&user_grpc.id).unwrap(),
            user_grpc.username,
            user_grpc.email,
            UserRole::from(
                users_grpc::Role::try_from(user_grpc.role)
                    .map_err(|_| AppError::IntenalError("Internal conversion error".to_string()))?,
            ),
            UserStatus::from(
                users_grpc::Status::try_from(user_grpc.status)
                    .map_err(|_| AppError::IntenalError("Internal conversion error".to_string()))?,
            ),
        ))
    }
}

impl TryFrom<users_grpc::ListOfUsers> for Vec<UserDto> {
    type Error = AppError;

    fn try_from(
        users_grpc_list_of_users: users_grpc::ListOfUsers,
    ) -> Result<Vec<UserDto>, Self::Error> {
        users_grpc_list_of_users
            .users
            .into_iter()
            .map(UserDto::try_from)
            .collect::<Result<Vec<UserDto>, Self::Error>>()
    }
}
