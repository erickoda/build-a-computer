type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD';

export class HttpError extends Error {
  constructor(public status: number, public message: string, public data?: any) {
    super(message);
    this.name = 'HttpError';
  }
}

export interface ApiOptions<TRequest> extends Omit<RequestInit, 'body' | 'method'> {
  method: HttpMethod,
  payload?: TRequest
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: HttpError | Error }

export default async function api<TResponse, TRequest = undefined>(endpoint: string, options: ApiOptions<TRequest>): Promise<ApiResult<TResponse>> {
  const baseUrl = "http://localhost:3000/api/v1/";
  const url = baseUrl + endpoint;
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  if (options.payload && (options.method === 'GET' || options.method === 'HEAD')) {
    return {
      ok: false,
      error: new Error(`The method ${options.method} should not have a body!`)
    };
  }

  if (options.payload) {
    config.body = JSON.stringify(options.payload);
  }
  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = null;
      }

      throw new HttpError(
        response.status,
        errorData?.message || `Unexpected HTTP error ${response.status}`
      );
    }

    if (response.status === 204) {
      return {
        ok: true,
        data: {} as TResponse
      };
    }

    return {
      ok: true,
      data: await response.json() as TResponse
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Unknown Error')
    };
  }
}

