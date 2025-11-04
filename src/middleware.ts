import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import '@/lib/env'; // Validate environment variables on startup

export default async function middleware(req: NextRequest) {
  // Check if the route requires authentication
  const { pathname } = req.nextUrl;
  
  // Skip middleware for public routes
  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  try {
    // Get session using Better Auth
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    // If no session and trying to access protected route, redirect to login
    if (!session?.user) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    const loginUrl = new URL('/auth/login', req.url);
    return NextResponse.redirect(loginUrl);
  }
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