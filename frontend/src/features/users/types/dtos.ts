export type CreateUserRequestDto = {
  username: string,
  email: string,
  password: string,
  role: UserRole
}

export type UpdateUserRequestDto = {
  username?: string,
  email?: string,
  password?: string,
  role?: UserRole,
  status?: UserStatus
}

export type UserResponseDto = {
  id: string,
  username: string,
  email: string,
  password: string,
  role: UserRole,
  status: UserStatus
}

export enum UserRole {
  Common = "common",
  Supervisor = "supervisor"
}

export enum UserStatus {
  Active = "active",
  Inactive = "inactive",
  Banned = "banned"
}

export const roleValues = Object.values(UserRole) as [string, ...string[]];

export const statusValues = Object.values(UserStatus) as [string, ...string[]];

