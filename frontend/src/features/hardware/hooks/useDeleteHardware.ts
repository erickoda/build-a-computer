import { ApiResult, HttpError } from '@/src/services/api';
import { useState } from 'react';

export function useDeleteHardware(remove: (id: string) => Promise<ApiResult<void>>) {
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const deleteItem = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(undefined);

    const result = await remove(id);

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      return false;
    }

    return true;
  };

  return { error, setError, isLoading, deleteItem };
}
