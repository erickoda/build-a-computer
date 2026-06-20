import { useState } from "react";
import { HttpError } from "@/src/services/api";
import apiGames from "../api/apiGames";

const useDeleteGame = () => {
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const deleteGameRequest = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiGames.deleteGame(id);

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
    deleteGameRequest
  };
};

export default useDeleteGame;
