import api, { ApiResult } from "@/src/services/api";
import { CreateGameRequestDto, GameResponseDto, UpdateGameRequestDto } from "../types/dtos";

const apiGames = {
  createGame: async (dto: CreateGameRequestDto): Promise<ApiResult<GameResponseDto>> => api<GameResponseDto, CreateGameRequestDto>("games", {
    method: 'POST',
    payload: dto
  }),

  getGames: async (): Promise<ApiResult<GameResponseDto[]>> => api<GameResponseDto[], void>("games", {
    method: 'GET'
  }),

  updateGame: async (id: string, dto: UpdateGameRequestDto): Promise<ApiResult<GameResponseDto>> => api<GameResponseDto, UpdateGameRequestDto>(`games/${id}`, {
    method: 'PATCH',
    payload: dto
  }),

  deleteGame: async (id: string): Promise<ApiResult<void>> => api<void, void>(`games/${id}`, {
    method: 'DELETE'
  }),
};

export default apiGames;
