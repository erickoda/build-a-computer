import { ApiResult, HttpError } from '@/src/services/api';
import { useCallback, useState } from 'react';

export function useHardwareList<TResponse>(list: () => Promise<ApiResult<TResponse[]>>) {
  const [items, setItems] = useState<TResponse[]>([]);
  const [error, setError] = useState<HttpError | Error | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const fetchItems = useCallback(async (): Promise<ApiResult<TResponse[]>> => {
    setIsLoading(true);
    setError(undefined);

    const result = await list();

    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
    } else {
      setItems(result.data);
    }

    return result;
  }, [list]);

  return { items, error, isLoading, fetchItems };
}
