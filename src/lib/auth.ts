import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';

export const auth = betterAuth({
  secret: process.env.NEXTAUTH_SECRET,
  baseURL: process.env.NEXTAUTH_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
  plugins: [
    nextCookies(),
  ],
  // Database configuration
  database: {
    provider: 'sqlite',
    url: process.env.DATABASE_URL || 'file:./dev.db',
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
  debug: false,
});


