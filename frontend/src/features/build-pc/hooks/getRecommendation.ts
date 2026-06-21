import { useCallback, useState } from "react";
import { ApiResult, HttpError } from "@/src/services/api";
import apiRecommendation from "../api/apiRecommendation";
import { PcResponseDto, RecommendationQueryParams } from "../types/dtos";

const useGetRecommendation = () => {
  const [pcs, setPcs] = useState<PcResponseDto[]>([]);
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const getRecommendation = useCallback(async (params: RecommendationQueryParams): Promise<ApiResult<PcResponseDto[]>> => {
    setIsLoading(true);
    setError(undefined);

    const result = await apiRecommendation.getRecommendation(params);

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
    } else {
      setPcs(result.data);
    }

    return result;
  }, []);

  return {
    error,
    setError,
    isLoading,
    pcs,
    getRecommendation,
  };
};

export default useGetRecommendation;
