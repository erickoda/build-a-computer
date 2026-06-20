import { useState, useEffect } from 'react';
import { getUserIdFromToken } from '../utils/jwt';
import { getCookie } from '../utils/cookies.client';

export function useCurrentUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = getCookie('access_token');
    if (token) setUserId(getUserIdFromToken(token));
  }, []);

  return userId;
}
