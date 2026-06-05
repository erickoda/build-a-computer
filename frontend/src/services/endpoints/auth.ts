import api, { ApiResult } from "../api";
import { SignInRequestDto, TokenDto, SignUpRequestDto } from "./dtos";

const authApi = {
  signIn: async (dto: SignInRequestDto): Promise<ApiResult<TokenDto>> => api<TokenDto, SignInRequestDto>("authenticate/sign-in", {
    method: 'POST',
    payload: dto
  }),

  signUp: async (dto: SignUpRequestDto): Promise<ApiResult<TokenDto>> => api<TokenDto, SignInRequestDto>("authenticate/sign-up", {
    method: 'POST',
    payload: dto
  }),
};

export default authApi;
