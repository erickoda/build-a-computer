use crate::modules::users::{dtos, handlers};
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::create_user,
        handlers::get_user,
        handlers::get_users,
        handlers::update_user,
        handlers::delete_user
    ),
    components(schemas(
        dtos::request::create_user::CreateUserRequestDto,
        dtos::request::update_user::UpdateUserDto,
        dtos::response::user::UserDto,
        dtos::user_role::UserRole,
        dtos::user_status::UserStatus,
    ))
)]
pub struct UsersApi;
