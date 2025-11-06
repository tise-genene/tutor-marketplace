import { z } from 'zod';

// Server-side environment variables schema
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Better Auth (primary)
  BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET is required').optional(),
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a valid URL').optional(),
  
  // Legacy NextAuth (for compatibility)
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL').optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  
  // Email (SMTP - optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // File Upload
  UPLOAD_DIR: z.string().optional(),
  
  // WebSocket
  NEXT_PUBLIC_WS_URL: z.string().url().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

// Client-side environment variables schema
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_WS_URL: z.string().url().optional(),
});

  // Validate server environment variables
const parsedServer = serverEnvSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  UPLOAD_DIR: process.env.UPLOAD_DIR,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsedServer.success) {
  const aggregated = parsedServer.error.issues
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join('\n');
  console.error('❌ Invalid server environment variables:\n', aggregated);
  throw new Error(`Invalid environment variables:\n${aggregated}`);
}

const envInternal = parsedServer.data;

// Production-specific validations
if (envInternal.NODE_ENV === 'production') {
  const requiredForProduction = [
    { key: 'BETTER_AUTH_SECRET', value: envInternal.BETTER_AUTH_SECRET },
    { key: 'BETTER_AUTH_URL', value: envInternal.BETTER_AUTH_URL },
  ];

  const missing = requiredForProduction.filter((item) => !item.value);
  
  if (missing.length > 0) {
    const missingKeys = missing.map((item) => item.key).join(', ');
    throw new Error(`Missing required environment variables for production: ${missingKeys}`);
  }
}

// Validate client environment variables (in browser)
if (typeof window !== 'undefined') {
  const parsedClient = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  });

  if (!parsedClient.success) {
    console.warn('⚠️ Some client environment variables are invalid:', parsedClient.error.issues);
  }
}

export const env = envInternal;

// Helper function to validate required env vars at runtime
export function validateEnv() {
  const errors: string[] = [];

  if (!env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  if (!env.BETTER_AUTH_SECRET) {
    errors.push('BETTER_AUTH_SECRET is required');
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  return true;
}


