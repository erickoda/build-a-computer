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

export enum UserRole {
  Admin,
  Supervisor,
  Common
}

export enum Status {
  Active,
  Inactive,
  Banned
}

export type CreateUserDto = {
  username: string,
  email: string,
  password: string,
  role: UserRole
}

export type UserDto = {
  username: string,
  email: string,
  password: string,
  role: UserRole
  status: Status
}
