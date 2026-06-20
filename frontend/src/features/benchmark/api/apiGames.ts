import api, { ApiResult } from "@/src/services/api";
import { GameResponseDto } from "../types/dtos";

const apiGames = {
  getGames: async (): Promise<ApiResult<GameResponseDto[]>> => api<GameResponseDto[], void>("games", {
    method: 'GET'
  }),
};

export default apiGames;
