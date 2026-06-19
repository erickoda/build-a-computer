import { useState, useEffect } from 'react';
import { Role } from '../types/jwt';
import { getRoleFromToken } from '../utils/jwt';
import { getCookie } from '../utils/cookies.client';

export function useRole(): Role | null {
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const token = getCookie('access_token');
    if (token) setRole(getRoleFromToken(token));
  }, []);

  return role;
}
