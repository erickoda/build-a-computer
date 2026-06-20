import { useCallback, useState } from "react";
import { ApiResult, HttpError } from "@/src/services/api";
import apiBenchmarks from "../api/apiBenchmarks";
import { BenchmarkResponseDto } from "../types/dtos";

const useFetchBenchmarks = () => {
  const [benchmarks, setBenchmarks] = useState<BenchmarkResponseDto[]>([]);
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchBenchmarks = useCallback(async (): Promise<ApiResult<BenchmarkResponseDto[]>> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiBenchmarks.getBenchmarks();

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
    } else {
      setBenchmarks(result.data);
    }

    return result;
  }, []);

  return {
    error,
    setError,
    isLoading,
    benchmarks,
    fetchBenchmarks
  };
};

export default useFetchBenchmarks;
