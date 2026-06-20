import { useState } from "react";
import { HttpError } from "@/src/services/api";
import apiGames from "../api/apiGames";
import { CreateGameRequestDto } from "../types/dtos";

const useCreateGame = () => {
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const createGameRequest = async (dto: CreateGameRequestDto): Promise<boolean> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiGames.createGame(dto);

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
    createGameRequest
  };
};

export default useCreateGame;
