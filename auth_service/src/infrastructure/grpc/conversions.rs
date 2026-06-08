use std::str::FromStr;

use tonic::Status as gRPCTonicStatus;
use uuid::Uuid;

use crate::{
    application::commands::{
        create_user::CreateUserCommand, forgot_password::ForgotPasswordCommand,
        reset_password::ResetPasswordCommand, update_user::UpdateUserCommand,
    },
    auth_grpc::{ForgotPasswordRequest, ResetPasswordRequest},
    domain::{
        entities::user::UserEntity,
        value_objects::{
            role::Role as ApplicationUserRole, status::Status as ApplicationUserStatus,
        },
    },
    users_grpc::{
        CreateUserRequest, ListOfUsers, Role as GRPCUserRole, Status as GRPCUserStatus,
        UpdateUserRequest, User,
    },
};

impl Into<CreateUserCommand> for CreateUserRequest {
    fn into(self) -> CreateUserCommand {
        CreateUserCommand::new(
            self.clone().username,
            self.clone().email,
            self.clone().password,
            self.role().into(),
        )
    }
}

impl Into<ApplicationUserRole> for GRPCUserRole {
    fn into(self) -> ApplicationUserRole {
        match self {
            GRPCUserRole::Admin => ApplicationUserRole::Admin,
            GRPCUserRole::Common => ApplicationUserRole::Common,
            GRPCUserRole::Supervisor => ApplicationUserRole::Supervisor,
        }
    }
}

impl Into<ApplicationUserStatus> for GRPCUserStatus {
    fn into(self) -> ApplicationUserStatus {
        match self {
            GRPCUserStatus::Active => ApplicationUserStatus::Active,
            GRPCUserStatus::Inactive => ApplicationUserStatus::Inactive,
            GRPCUserStatus::Banned => ApplicationUserStatus::Banned,
        }
    }
}

impl From<UserEntity> for User {
    fn from(user_entity: UserEntity) -> Self {
        Self {
            id: user_entity.get_id().to_string(),
            username: user_entity.get_username().into(),
            email: user_entity.get_email().into(),
            role: GRPCUserRole::from(user_entity.get_role()).into(),
            status: GRPCUserStatus::from(user_entity.get_status()).into(),
        }
    }
}

impl From<&ApplicationUserStatus> for GRPCUserStatus {
    fn from(application_user_status: &ApplicationUserStatus) -> Self {
        match application_user_status {
            ApplicationUserStatus::Active => Self::Active,
            ApplicationUserStatus::Inactive => Self::Inactive,
            ApplicationUserStatus::Banned => Self::Banned,
        }
    }
}

impl From<&ApplicationUserRole> for GRPCUserRole {
    fn from(application_user_role: &ApplicationUserRole) -> Self {
        match application_user_role {
            ApplicationUserRole::Admin => Self::Admin,
            ApplicationUserRole::Supervisor => Self::Supervisor,
            ApplicationUserRole::Common => Self::Common,
        }
    }
}

impl From<Vec<UserEntity>> for ListOfUsers {
    fn from(users_entity: Vec<UserEntity>) -> Self {
        Self {
            users: users_entity
                .iter()
                .map(|user| User {
                    id: user.get_id().to_string(),
                    username: user.get_username().into(),
                    email: user.get_email().into(),
                    role: GRPCUserRole::from(user.get_role()).into(),
                    status: GRPCUserStatus::from(user.get_status()).into(),
                })
                .collect::<Vec<User>>(),
        }
    }
}

impl TryInto<UpdateUserCommand> for UpdateUserRequest {
    type Error = gRPCTonicStatus;

    fn try_into(self) -> Result<UpdateUserCommand, Self::Error> {
        let id =
            Uuid::from_str(&self.id).map_err(|_| Self::Error::invalid_argument("Invalid id"))?;

        let role = self
            .role
            .and_then(|r| GRPCUserRole::try_from(r).ok())
            .map(Into::into);

        let status = self
            .status
            .and_then(|s| GRPCUserStatus::try_from(s).ok())
            .map(Into::into);

        Ok(UpdateUserCommand::new(
            id,
            self.username,
            self.email,
            self.password,
            role,
            status,
        ))
    }
}

impl Into<ForgotPasswordCommand> for ForgotPasswordRequest {
    fn into(self) -> ForgotPasswordCommand {
        ForgotPasswordCommand::new(self.email)
    }
}

impl Into<ResetPasswordCommand> for ResetPasswordRequest {
    fn into(self) -> ResetPasswordCommand {
        ResetPasswordCommand::new(self.email, self.otp, self.new_password)
    }
}
