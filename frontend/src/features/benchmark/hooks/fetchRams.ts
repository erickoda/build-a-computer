import { useCallback, useState } from "react";
import { ApiResult, HttpError } from "@/src/services/api";
import apiHardware from "../api/apiHardware";
import { RamResponseDto } from "../types/dtos";

const useFetchRams = () => {
  const [rams, setRams] = useState<RamResponseDto[]>([]);
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchRams = useCallback(async (): Promise<ApiResult<RamResponseDto[]>> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiHardware.getRams();

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
    } else {
      setRams(result.data);
    }

    return result;
  }, []);

  return {
    error,
    setError,
    isLoading,
    rams,
    fetchRams
  };
};

export default useFetchRams;
