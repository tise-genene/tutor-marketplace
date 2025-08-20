import { z } from 'zod';

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXT_PUBLIC_WS_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

const parsed = serverEnvSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  const aggregated = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid environment variables:\n${aggregated}`);
}

const envInternal = parsed.data;

if (envInternal.NODE_ENV === 'production') {
  if (!envInternal.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is required in production');
  }
  if (!envInternal.NEXTAUTH_URL) {
    throw new Error('NEXTAUTH_URL is required in production');
  }
}

export const env = envInternal;


