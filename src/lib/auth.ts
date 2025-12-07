import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { Pool } from 'pg';

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

// Log database URL (without password) for debugging
const dbUrl = process.env.DATABASE_URL;
const dbUrlSafe = dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'not set';
console.log('🔐 Better Auth initializing with database:', dbUrlSafe);

// Create PostgreSQL connection pool with SSL for Supabase
// Better Auth needs a Pool instance with SSL configuration for Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') ? {
    rejectUnauthorized: false // Supabase uses self-signed certificates
  } : undefined,
});

let auth;
try {
  auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'),
  plugins: [
    nextCookies(),
  ],
  emailAndPassword: {
    enabled: true,
  },
  // Database configuration - using PostgreSQL Pool with SSL (Supabase)
  database: pool,
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
  console.log('✅ Better Auth initialized successfully');
} catch (error: any) {
  console.error('❌ Better Auth initialization failed:', error);
  console.error('Error details:', {
    message: error?.message,
    stack: error?.stack,
    cause: error?.cause,
  });
  throw new Error(
    `Failed to initialize Better Auth: ${error?.message || 'Unknown error'}\n` +
    'Check your DATABASE_URL and ensure the database is accessible.'
  );
}

export { auth };


