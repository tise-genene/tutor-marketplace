import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  plugins: [
    nextCookies(),
  ],
  // Database configuration - using PostgreSQL (Supabase)
  database: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
  },
  // User configuration
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
      },
    },
  },
  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  // Pages configuration
  pages: { 
    signIn: '/auth/login',
    error: '/auth/error'
  },
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
});


