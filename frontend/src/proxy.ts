import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { matchesRoute, routesInfos } from './types/routes';
import { getRoleFromToken } from './utils/jwt';
import { roleDefaultRedirect } from './utils/redirect';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  const matchedRoute = routesInfos.find(
    (route) => !route.isPublic && matchesRoute(pathname, route.href),
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

  if (isProtectedRoute && !matchedRoute.allowedRoles.includes(role)) {
    return NextResponse.redirect(
      new URL(roleDefaultRedirect[role], request.url),
    );
  }

  return NextResponse.next();
}
