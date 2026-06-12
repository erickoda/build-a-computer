import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Role } from './types/jwt';
import { getRoleFromToken } from './utils/jwt';

const publicRoutes = ['/sign-in', '/sign-up'];

const routePermissions: Record<string, Role[]> = {
  '/users': ['admin', 'supervisor'],
  '/benchmarks': ['admin', 'supervisor', 'common'],
};

const roleDefaultRedirect: Record<Role, string> = {
  admin: '/users',
  supervisor: '/users',
  common: '/benchmarks',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const matchedRoute = Object.keys(routePermissions).find((route) =>
    pathname.startsWith(route)
  );
  const isProtectedRoute = !!matchedRoute;

  if (isProtectedRoute && !token) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  if (!token) {
    return NextResponse.next();
  }

  const role = getRoleFromToken(token);

  if (!role) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  if (isPublicRoute) {
    return NextResponse.redirect(new URL(roleDefaultRedirect[role], request.url));
  }

  if (isProtectedRoute && !routePermissions[matchedRoute!].includes(role)) {
    return NextResponse.redirect(new URL(roleDefaultRedirect[role], request.url));
  }

  return NextResponse.next();
}
