import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Add custom middleware logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/login',
    },
  }
);

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