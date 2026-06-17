use crate::modules::auth::{dtos, handlers};
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::sign_in,
        handlers::sign_up,
        handlers::forgot_password,
        handlers::reset_password
    ),
    components(schemas(
        dtos::request::sign_in::SignInRequestDto,
        dtos::request::sign_up::SignUpRequestDto,
        dtos::request::forgot_password::ForgotPasswordDto,
        dtos::request::reset_password::ResetPasswordDto,
        dtos::response::auth::AuthResponseDto,
    ))
)]
pub struct AuthApi;
