# Vercel Environment Variables Setup for Better Auth

## Required Environment Variables

Add these to your Vercel project settings:

### 1. Better Auth Configuration
```
BETTER_AUTH_URL=https://your-domain.vercel.app
BETTER_AUTH_SECRET=your-secret-key-here
```

### 2. Database Configuration  
```
DATABASE_URL=your-database-connection-string
```

### 3. Legacy Support (for migration)
```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
```

## How to Add in Vercel Dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable above
4. Redeploy your project

## For Local Development:

Copy `env.example` to `.env.local` and update the values:

```bash
cp env.example .env.local
```

Then edit `.env.local` with your actual values.

## Generate Secret Keys:

For `BETTER_AUTH_SECRET` and `NEXTAUTH_SECRET`, use:
```bash
openssl rand -base64 32
```

Or use an online generator: https://generate-secret.vercel.app/32
