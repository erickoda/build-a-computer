import { useCallback, useState } from "react";
import { ApiResult, HttpError } from "@/src/services/api";
import apiGames from "../api/apiGames";
import { GameResponseDto } from "../types/dtos";

const useFetchGames = () => {
  const [games, setGames] = useState<GameResponseDto[]>([]);
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchGames = useCallback(async (): Promise<ApiResult<GameResponseDto[]>> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiGames.getGames();

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
    } else {
      setGames(result.data);
    }

    return result;
  }, []);

  return {
    error,
    setError,
    isLoading,
    games,
    fetchGames
  };
};

export default useFetchGames;
