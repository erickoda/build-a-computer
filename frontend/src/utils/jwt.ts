import { Role } from "../types/jwt";

export function getRoleFromToken(token: string): Role | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}
