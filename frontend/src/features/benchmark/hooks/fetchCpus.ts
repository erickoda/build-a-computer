import { useCallback, useState } from "react";
import { ApiResult, HttpError } from "@/src/services/api";
import apiHardware from "../api/apiHardware";
import { CpuResponseDto } from "../types/dtos";

const useFetchCpus = () => {
  const [cpus, setCpus] = useState<CpuResponseDto[]>([]);
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchCpus = useCallback(async (): Promise<ApiResult<CpuResponseDto[]>> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiHardware.getCpus();

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
    } else {
      setCpus(result.data);
    }

    return result;
  }, []);

  return {
    error,
    setError,
    isLoading,
    cpus,
    fetchCpus
  };
};

export default useFetchCpus;
