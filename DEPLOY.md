# 🚀 Tutorly Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Prerequisites Checklist
- [ ] Supabase project created and schema run
- [ ] GitHub repository created
- [ ] All environment variables ready

### Step 1: Push to GitHub

```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "Add New Project"**
3. **Import your GitHub repository**
4. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

### Step 3: Set Environment Variables in Vercel

Go to **Settings → Environment Variables** and add:

#### Required Variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database (for Better Auth)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require

# Better Auth
BETTER_AUTH_URL=https://your-app.vercel.app
BETTER_AUTH_SECRET=your-generated-secret-here
```

#### Optional Variables:

```env
# Stripe (if using payments)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (if using Resend)
RESEND_API_KEY=re_...
```

**Important:** 
- Set these for **Production**, **Preview**, and **Development** environments
- Replace `[PASSWORD]` and `[PROJECT-REF]` with actual values
- Generate secrets: `openssl rand -base64 32`

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-5 minutes)
3. Your app will be live at `https://your-project.vercel.app`

### Step 5: Update Supabase Settings

After deployment, update Supabase:

1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. Set **Site URL**: `https://your-app.vercel.app`
3. Add **Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/**`

### Step 6: Verify Deployment

- [ ] Visit your deployed URL
- [ ] Test registration
- [ ] Test login
- [ ] Check API routes work
- [ ] Verify database connections

---

## Alternative: Docker Deployment

### Build Docker Image

```bash
docker build -t tutorly:latest .
```

### Run Locally

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="your-database-url" \
  -e NEXT_PUBLIC_SUPABASE_URL="your-supabase-url" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
  tutorly:latest
```

### Deploy to Cloud Providers

- **Railway**: Connect GitHub repo, auto-deploys
- **Render**: Connect GitHub repo, set environment variables
- **DigitalOcean App Platform**: Connect GitHub repo
- **AWS/GCP/Azure**: Use container registry

---

## Pre-Deployment Checklist

### Code
- [ ] All critical bugs fixed
- [ ] Environment variables documented
- [ ] No hardcoded secrets
- [ ] Build succeeds locally (`npm run build`)

### Database
- [ ] Supabase schema created
- [ ] Database migrations applied
- [ ] Seed data (if needed)

### Environment Variables
- [ ] All required variables documented
- [ ] Production values ready
- [ ] Secrets generated

### Testing
- [ ] Registration works
- [ ] Login works
- [ ] API routes respond correctly
- [ ] Database queries work

---

## Post-Deployment

### 1. Test Core Features
- User registration
- User login
- Tutor search
- Booking creation
- Messaging

### 2. Monitor
- Check Vercel logs for errors
- Monitor Supabase dashboard
- Check database connections

### 3. Set Up Monitoring (Optional)
- Vercel Analytics
- Sentry for error tracking
- Supabase monitoring

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel
- Ensure all dependencies are in `package.json`
- Verify TypeScript errors are resolved

### Environment Variables Not Working
- Ensure variables are set for correct environment (Production/Preview)
- Check variable names match exactly
- Redeploy after adding variables

### Database Connection Errors
- Verify DATABASE_URL format
- Check Supabase project is active
- Ensure database password is correct

### Better Auth Errors
- Verify BETTER_AUTH_SECRET is set
- Check BETTER_AUTH_URL matches deployment URL
- Ensure DATABASE_URL is correct

### Environment Variable "NEXTAUTH_URL" references Secret that does not exist
**Problem:** Vercel shows error: `Environment Variable "NEXTAUTH_URL" references Secret "nextauth_url", which does not exist.`

**Solution:**
1. Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Find `NEXTAUTH_URL` in the list and **delete it** - we no longer use NextAuth
3. Ensure `BETTER_AUTH_URL` is set to your deployment URL (e.g., `https://your-app.vercel.app`)
4. Ensure `BETTER_AUTH_SECRET` is set

**Note:** We only use Better Auth now. `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are not used. If `BETTER_AUTH_URL` is not set, the app will automatically use `VERCEL_URL`.

---

## Quick Reference

### Get Supabase Credentials
1. Dashboard → Settings → API
2. Copy: URL, Anon Key, Service Role Key
3. Dashboard → Settings → Database
4. Copy: Connection String (URI)

### Generate Secrets
```bash
# Better Auth Secret
openssl rand -base64 32

# Or use online generator
# https://generate-secret.vercel.app/32
```

### Vercel CLI (Alternative)
```bash
npm i -g vercel
vercel login
vercel
```

---

## Need Help?

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

