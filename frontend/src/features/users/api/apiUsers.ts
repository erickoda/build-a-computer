import api, { ApiResult } from "@/src/services/api";
import { CreateUserRequestDto, UserResponseDto, UpdateUserRequestDto } from "../types/dtos";

const apiUsers = {
  createUser: async (dto: CreateUserRequestDto): Promise<ApiResult<UserResponseDto>> => api<UserResponseDto, CreateUserRequestDto>("users", {
    method: 'POST',
    payload: dto
  }),

  getUser: async (id: string): Promise<ApiResult<UserResponseDto>> => api<UserResponseDto, void>(`users/${id}`, {
    method: 'GET'
  }),

  getUsers: async (): Promise<ApiResult<UserResponseDto[]>> => api<UserResponseDto[], void>(`users`, {
    method: 'GET'
  }),

  deleteUser: async (id: string): Promise<ApiResult<void>> => api<void, void>(`users/${id}`, {
    method: 'DELETE'
  }),

  updateUser: async (id: string, dto: UpdateUserRequestDto): Promise<ApiResult<void>> => api<void, UpdateUserRequestDto>(`users/${id}`, {
    method: 'PATCH',
    payload: dto
  }),
};

export default apiUsers;

