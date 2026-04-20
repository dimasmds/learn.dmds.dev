import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/dashboard', '/profile', '/learn'];
const authPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is a protected route
  const isProtectedPath = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  // Check if the path is an auth route
  const isAuthPath = authPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );

  // Note: We can't easily check httpOnly cookies for JWT here because
  // the access token is stored in Zustand (client-side). The refresh_token
  // cookie exists but we can't verify it without calling the API.
  // The client-side AuthProvider handles the actual redirect logic.
  // This middleware is a secondary guard that checks for the refresh_token cookie presence.

  const hasRefreshToken = request.cookies.has('refresh_token');

  if (isProtectedPath && !hasRefreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPath && hasRefreshToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/learn/:path*',
    '/login',
    '/register',
  ],
};
