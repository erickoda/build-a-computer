import api, { ApiResult } from "../api";
import { SignInRequestDto, SignInResponseDto } from "./dtos";

const authApi = {
  signIn: async (dto: SignInRequestDto): Promise<ApiResult<SignInResponseDto>> => api<SignInResponseDto, SignInRequestDto>("authenticate", {
    method: 'POST',
    payload: dto
  }),
};

export default authApi;
