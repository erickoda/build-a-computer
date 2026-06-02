import api, { ApiResult } from "../api";
import { CreateUserDto, UserDto } from "./dtos";

const usersApi = {
  create: async (dto: CreateUserDto): Promise<ApiResult<UserDto>> => api<UserDto, CreateUserDto>("users", {
    method: 'POST',
    payload: dto
  }),

  get_user: async (user_id: string): Promise<ApiResult<UserDto>> => api<UserDto, void>(`users/${user_id}`, {
    method: 'GET'
  }),

  get_users: async (): Promise<ApiResult<UserDto[]>> => api<UserDto[], void>('users', {
    method: 'GET'
  }),

  delete: async (user_id: string): Promise<ApiResult<void>> => api<void, void>(`users/${user_id}`, {
    method: 'DELETE'
  }),
};

export default usersApi;
