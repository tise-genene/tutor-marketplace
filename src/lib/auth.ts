import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';

// Validate required environment variables before initializing Better Auth
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error(
    'BETTER_AUTH_SECRET is required. Please set it in your .env.local file.\n' +
    'Generate one with: openssl rand -base64 32'
  );
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is required. Please set it in your .env.local file.\n' +
    'Get it from Supabase Dashboard → Settings → Database → Connection string'
  );
}

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


