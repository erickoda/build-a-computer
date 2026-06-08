export type SignInRequestDto = {
  email: string,
  password: string
}

export type SignUpRequestDto = {
  username: string,
  email: string,
  password: string,
}

export type TokenDto = {
  token: string
}

export type ForgotPasswordRequestDto = {
  email: string,
}

export type ResetPasswordRequestDto = {
  email: string,
  newPassword: string,
  otp: string
}
