import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export default async function middleware(req: NextRequest) {
  // Check if the route requires authentication
  const { pathname } = req.nextUrl;
  
  // Skip middleware for public routes
  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Validate session using Better Auth - this verifies the token is valid and not expired
  try {
    const session = await auth.api.getSession({ 
      headers: req.headers 
    });

    // If no valid session, redirect to login
    if (!session?.user) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch (error) {
    // If session validation fails, redirect to login
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