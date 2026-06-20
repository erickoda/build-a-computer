import { useCallback, useState } from "react";
import { ApiResult, HttpError } from "@/src/services/api";
import apiHardware from "../api/apiHardware";
import { GpuResponseDto } from "../types/dtos";

const useFetchGpus = () => {
  const [gpus, setGpus] = useState<GpuResponseDto[]>([]);
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchGpus = useCallback(async (): Promise<ApiResult<GpuResponseDto[]>> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiHardware.getGpus();

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
    } else {
      setGpus(result.data);
    }

    return result;
  }, []);

  return {
    error,
    setError,
    isLoading,
    gpus,
    fetchGpus
  };
};

export default useFetchGpus;
