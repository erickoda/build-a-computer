import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Role } from '../types/jwt';
import { getRoleFromToken } from '../utils/jwt';
import { getCookie } from '../utils/cookies.client';

export function useRole(): Role | null {
  const [role, setRole] = useState<Role | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const token = getCookie('access_token');
    setRole(token ? getRoleFromToken(token) : null);
  }, [pathname]);

  return role;
}
