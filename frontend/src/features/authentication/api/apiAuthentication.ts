import api, { ApiResult } from "@/src/services/api";
import { ForgotPasswordRequestDto, ResetPasswordRequestDto, SignInRequestDto, SignUpRequestDto, TokenDto } from "../types/dtos";

const apiAuthentication = {
  signIn: async (dto: SignInRequestDto): Promise<ApiResult<TokenDto>> => api<TokenDto, SignInRequestDto>("auth/sign-in", {
    method: 'POST',
    payload: dto
  }),

  signUp: async (dto: SignUpRequestDto): Promise<ApiResult<TokenDto>> => api<TokenDto, SignInRequestDto>("auth/sign-up", {
    method: 'POST',
    payload: dto
  }),

  forgotPassword: async (dto: ForgotPasswordRequestDto):
    Promise<ApiResult<void>> => api<void, ForgotPasswordRequestDto>(
      "auth/forgot-password",
      {
        method: 'POST',
        payload: dto
      }
    ),

  resetPassword: async (dto: ResetPasswordRequestDto):
    Promise<ApiResult<void>> => api<void, ResetPasswordRequestDto>(
      "auth/reset-password",
      {
        method: 'POST',
        payload: dto
      })
};

export default apiAuthentication;
