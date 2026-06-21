import api, { ApiResult } from "@/src/services/api";
import { GameResponseDto, UpdateGameRequestDto } from "../types/dtos";

const apiGames = {
  getGames: async (): Promise<ApiResult<GameResponseDto[]>> => api<GameResponseDto[], void>("games", {
    method: 'GET'
  }),
  updateGame: async (id: string, dto: UpdateGameRequestDto): Promise<ApiResult<GameResponseDto>> =>
    api<GameResponseDto, UpdateGameRequestDto>(`games/${id}`, {
      method: 'PATCH',
      payload: dto,
    }),
};

export default apiGames;
