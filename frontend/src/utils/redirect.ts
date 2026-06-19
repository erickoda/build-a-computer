import { Role } from "../types/jwt";

export const roleDefaultRedirect: Record<Role, string> = {
  admin: '/users',
  supervisor: '/users',
  common: '/benchmarks',
};

