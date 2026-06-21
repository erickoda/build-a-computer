import { useState } from "react";
import { HttpError } from "@/src/services/api";
import apiBenchmarks from "../api/apiBenchmarks";

const useDeleteBenchmark = () => {
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const deleteBenchmarkRequest = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiBenchmarks.deleteBenchmark(id);

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
    deleteBenchmarkRequest
  };
};

export default useDeleteBenchmark;
