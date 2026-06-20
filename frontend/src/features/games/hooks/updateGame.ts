import { useState } from "react";
import { HttpError } from "@/src/services/api";
import apiGames from "../api/apiGames";
import { UpdateGameRequestDto } from "../types/dtos";

const useUpdateGame = () => {
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const updateGameRequest = async (id: string, dto: UpdateGameRequestDto): Promise<boolean> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiGames.updateGame(id, dto);

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      return false;
    }

    return true;
  };

  return {
    error,
    setError,
    isLoading,
    updateGameRequest
  };
};

export default useUpdateGame;
