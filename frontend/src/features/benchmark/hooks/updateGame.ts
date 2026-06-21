import { useState } from "react";
import { ApiResult, HttpError } from "@/src/services/api";
import apiGames from "../api/apiGames";
import { GameResponseDto, UpdateGameRequestDto } from "../types/dtos";

const useUpdateGame = () => {
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const updateGame = async (id: string, dto: UpdateGameRequestDto): Promise<ApiResult<GameResponseDto>> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiGames.updateGame(id, dto);

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
    }

    return result;
  };

  return {
    error,
    setError,
    isLoading,
    updateGame,
  };
};

export default useUpdateGame;
