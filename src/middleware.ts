import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  // Check if the route requires authentication
  const { pathname } = req.nextUrl;
  
  // Skip middleware for public routes
  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Check for Better Auth session cookie
  // Better Auth uses various cookie names depending on configuration
  const sessionToken = req.cookies.get('better-auth.session_token') || 
                       req.cookies.get('better-auth.session-token') ||
                       req.cookies.get('better-auth.sessionToken') ||
                       req.cookies.get('session_token');

  // If no session cookie and trying to access protected route, redirect to login
  if (!sessionToken) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes that require authentication
    '/dashboard/:path*',
    '/tutor/:path*',
    '/profile/:path*',
    '/proposals/:path*',
    '/calendar/:path*',
    '/search',
    '/bookings/:path*',
    '/messages/:path*',
    '/api/bookings/:path*',
    '/api/proposals/:path*',
    '/api/calendar/:path*',
    '/api/messages/:path*',
    '/api/upload',
  ],
}; 