# Deployment Guide

## Deploy to Vercel

### 1. Prepare Your Repository
- Push your code to GitHub
- Ensure all environment variables are ready

### 2. Environment Variables for Production
Create these in your Vercel project settings:

```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
```

### 3. Deploy Steps
1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### 4. Database Setup
For production, use Supabase PostgreSQL:
1. Create Supabase project
2. Get connection string
3. Update DATABASE_URL in Vercel
4. Run migrations: `npx prisma db push`
5. Seed data: `npm run db:seed`

### 5. Custom Domain (Optional)
- Add custom domain in Vercel dashboard
- Update NEXTAUTH_URL accordingly

## Alternative: Deploy to Netlify

### 1. Build Settings
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 18.x

### 2. Environment Variables
Same as Vercel, but set in Netlify dashboard

## Post-Deployment Checklist
- [ ] Test authentication
- [ ] Test tutor search
- [ ] Test proposal submission
- [ ] Test messaging
- [ ] Verify database connections
- [ ] Check error logs
- [ ] Test responsive design
