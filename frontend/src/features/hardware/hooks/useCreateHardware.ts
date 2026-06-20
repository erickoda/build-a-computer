import { ApiResult, HttpError } from '@/src/services/api';
import { useState } from 'react';

export function useCreateHardware<TResponse, TCreate>(
  create: (dto: TCreate) => Promise<ApiResult<TResponse>>,
) {
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const createItem = async (dto: TCreate): Promise<boolean> => {
    setIsLoading(true);
    setError(undefined);

    const result = await create(dto);

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      return false;
    }

    return true;
  };

  return { error, setError, isLoading, createItem };
}
