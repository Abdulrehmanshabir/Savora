import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const path = request.nextUrl.pathname;

  const isAuthPage = path === '/login' || path === '/signup';

  // If user is NOT logged in and trying to access any page other than login/signup
  if (!session && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    // Optionally preserve the attempted URL to redirect back after login
    if (path !== '/') {
      loginUrl.searchParams.set('redirect', path);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If user is already logged in and visits login or signup page
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - api routes
     * - favicon.ico, images, svg, icons
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

