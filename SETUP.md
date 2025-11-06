# Environment Variables Setup Guide

## Required Environment Variables

### 1. Supabase Configuration

Get these from **Supabase Dashboard → Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**How to find:**
- Project URL: Top of API settings page
- Anon key: Under "Project API keys" → `anon` `public`
- Service role key: Under "Project API keys" → `service_role` `secret` (keep this secure!)

### 2. Database Connection String (for Better Auth)

Get this from **Supabase Dashboard → Settings → Database → Connection string → URI**:

```env
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
```

**OR use the direct connection string:**

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

**How to find:**
1. Go to Settings → Database
2. Scroll to "Connection string"
3. Select "URI" tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password (set when creating the project)

### 3. Better Auth Configuration

```env
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-random-secret-key-here
```

**Generate secret:**
```bash
openssl rand -base64 32
```

Or use: https://generate-secret.vercel.app/32

### 4. Complete .env.local Example

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (for Better Auth)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres?sslmode=require

# Better Auth
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-generated-secret-here

# Stripe (optional - for payments)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Email (optional)
RESEND_API_KEY=re_...
```

## Verification Steps

1. **Check Supabase URL format:**
   - Should start with `https://`
   - Should end with `.supabase.co`
   - Example: `https://abcdefghijklmnop.supabase.co`

2. **Check DATABASE_URL format:**
   - Should start with `postgresql://`
   - Should contain your actual password (not `[YOUR-PASSWORD]`)
   - Should include `?sslmode=require`

3. **After setting up:**
   - Restart your dev server (`npm run dev`)
   - Better Auth will automatically create its tables on first connection
   - Check Supabase Dashboard → Table Editor to see Better Auth tables

## Troubleshooting

### "Failed to initialize database adapter"
- Check DATABASE_URL is set correctly
- Verify password is correct (no special characters that need URL encoding)
- Ensure database is accessible (not paused)

### "fetch failed" errors
- Check NEXT_PUBLIC_SUPABASE_URL is set
- Check NEXT_PUBLIC_SUPABASE_ANON_KEY is set
- Verify URL format is correct
- Ensure Supabase project is active

### Better Auth tables not created
- Check DATABASE_URL connection string
- Ensure you have database write permissions
- Check Supabase logs for connection errors

