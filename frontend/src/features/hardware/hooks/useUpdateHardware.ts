import { ApiResult, HttpError } from '@/src/services/api';
import { useState } from 'react';

export function useUpdateHardware<TResponse, TCreate>(
  update: (id: string, dto: TCreate) => Promise<ApiResult<TResponse>>,
) {
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const updateItem = async (id: string, dto: TCreate): Promise<boolean> => {
    setIsLoading(true);
    setError(undefined);

    const result = await update(id, dto);

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      return false;
    }

    return true;
  };

  return { error, setError, isLoading, updateItem };
}
