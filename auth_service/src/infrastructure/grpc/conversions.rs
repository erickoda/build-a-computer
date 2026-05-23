use crate::{
    application::commands::create_user::CreateUserCommand,
    domain::{
        entities::user::UserEntity,
        value_objects::{
            role::Role as ApplicationUserRole, status::Status as ApplicationUserStatus,
        },
    },
    users_grpc::{
        CreateUserRequest, ListOfUsers, Role as GRPCUserRole, Status as GRPCUserStatus, User,
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
