import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /about, /dashboard)
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/register' || path === '/';

  // Firebase Auth uses different cookie names - check for Firebase auth cookies
  const firebaseAuthCookies = [
    'firebase:authUser',
    '__session',
    'auth-token'
  ];
  
  const hasAuthCookie = firebaseAuthCookies.some(cookieName => 
    request.cookies.get(cookieName)?.value
  );

  // If the user is not authenticated and trying to access a protected route
  if (!isPublicPath && !hasAuthCookie) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // If the user is authenticated and trying to access login/register
  if (isPublicPath && hasAuthCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
