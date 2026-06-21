import api, { ApiResult } from "@/src/services/api";
import { PcResponseDto, RecommendationQueryParams } from "../types/dtos";

const apiRecommendation = {
  getRecommendation: async (params: RecommendationQueryParams): Promise<ApiResult<PcResponseDto[]>> => {
    const query = new URLSearchParams({
      games: params.games.join(','),
      max_price: String(params.maxPrice),
      resolution: String(params.resolution),
      computer_performance: params.computerPerformance,
    });

    return api<PcResponseDto[], void>(`recommendation?${query.toString()}`, {
      method: 'GET',
    });
  },
};

export default apiRecommendation;
