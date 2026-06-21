import { useState } from "react";
import { HttpError } from "@/src/services/api";
import apiBenchmarks from "../api/apiBenchmarks";
import { CreateBenchmarkRequestDto } from "../types/dtos";

const useCreateBenchmark = () => {
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const createBenchmarkRequest = async (dto: CreateBenchmarkRequestDto): Promise<boolean> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiBenchmarks.createBenchmark(dto);

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
    createBenchmarkRequest
  };
};

export default useCreateBenchmark;
