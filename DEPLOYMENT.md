# Tutorly - Production Deployment Guide

## Overview
This guide will help you deploy the Tutorly application to production using Supabase for the backend and Vercel for the frontend.

## Prerequisites
- [Supabase Account](https://supabase.com)
- [Vercel Account](https://vercel.com)
- [Stripe Account](https://stripe.com) (for payments)
- [GitHub Account](https://github.com)

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `tutorly`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"

### 1.2 Set Up Database Schema
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click "Run" to execute the schema

### 1.3 Configure Authentication
1. Go to **Authentication > Settings**
2. Configure your site URL:
   - **Site URL**: `https://your-domain.vercel.app`
   - **Redirect URLs**: 
     - `https://your-domain.vercel.app/auth/callback`
     - `http://localhost:3000/auth/callback` (for development)
3. Save changes

### 1.4 Set Up Storage
1. Go to **Storage**
2. Verify the buckets are created:
   - `avatars` (public)
   - `documents` (public)
   - `voice-messages` (public)

### 1.5 Get API Keys
1. Go to **Settings > API**
2. Copy the following values:
   - **Project URL**
   - **Anon public key**
   - **Service role key** (keep this secret!)

## Step 2: Set Up Stripe

### 2.1 Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Complete account setup
3. Get your API keys:
   - **Publishable key**
   - **Secret key**
   - **Webhook secret** (create a webhook endpoint)

### 2.2 Configure Webhooks
1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copy the webhook secret

## Step 3: Deploy to Vercel

### 3.1 Connect GitHub Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings

### 3.2 Set Environment Variables
In Vercel project settings, add these environment variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_generated_secret_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password
```

### 3.3 Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Your app will be available at `https://your-domain.vercel.app`

## Step 4: Configure Domain (Optional)

### 4.1 Custom Domain
1. In Vercel, go to **Settings > Domains**
2. Add your custom domain
3. Configure DNS records as instructed
4. Update Supabase site URL and redirect URLs

## Step 5: Post-Deployment Setup

### 5.1 Test Authentication
1. Visit your deployed app
2. Test user registration and login
3. Verify email confirmation works

### 5.2 Test Real-time Features
1. Open chat in multiple browser windows
2. Test real-time messaging
3. Verify typing indicators and online status

### 5.3 Test Payments
1. Use Stripe test cards to test payments
2. Verify webhook handling
3. Test booking flow

### 5.4 Monitor Performance
1. Set up Vercel Analytics
2. Monitor Supabase usage
3. Set up error tracking (Sentry recommended)

## Step 6: Production Checklist

### Security
- [ ] All environment variables are set
- [ ] Supabase RLS policies are active
- [ ] API keys are secure
- [ ] HTTPS is enabled
- [ ] CORS is configured

### Performance
- [ ] Images are optimized
- [ ] Database indexes are created
- [ ] CDN is configured
- [ ] Caching is implemented

### Monitoring
- [ ] Error tracking is set up
- [ ] Performance monitoring is active
- [ ] Database monitoring is configured
- [ ] Uptime monitoring is enabled

## Step 7: Maintenance

### Regular Tasks
1. **Database Backups**: Supabase handles this automatically
2. **Security Updates**: Keep dependencies updated
3. **Performance Monitoring**: Monitor usage and optimize
4. **User Support**: Set up support channels

### Scaling Considerations
1. **Database**: Supabase scales automatically
2. **File Storage**: Supabase Storage scales with usage
3. **CDN**: Vercel provides global CDN
4. **Real-time**: Supabase Realtime handles scaling

## Troubleshooting

### Common Issues

#### Authentication Issues
- Verify Supabase URL and keys
- Check redirect URLs configuration
- Ensure NEXTAUTH_SECRET is set

#### Real-time Not Working
- Check Supabase Realtime is enabled
- Verify channel subscriptions
- Check network connectivity

#### File Upload Issues
- Verify storage bucket permissions
- Check file size limits
- Ensure proper CORS configuration

#### Payment Issues
- Verify Stripe keys
- Check webhook endpoint
- Test with Stripe test mode

### Support Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Stripe Documentation](https://stripe.com/docs)

## Cost Estimation

### Supabase (Free Tier)
- Database: 500MB
- Auth: 50,000 users
- Storage: 1GB
- Real-time: 2 concurrent connections

### Vercel (Free Tier)
- Bandwidth: 100GB
- Function execution: 100GB-hours
- Build minutes: 6,000 minutes

### Stripe
- No monthly fees
- 2.9% + 30¢ per successful transaction

## Next Steps

1. **Analytics**: Set up Google Analytics or Plausible
2. **Email Service**: Configure transactional emails
3. **SMS**: Add SMS notifications
4. **Mobile App**: Consider React Native app
5. **Advanced Features**: Add video calls, whiteboard, etc.

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **API Keys**: Rotate keys regularly
3. **User Data**: Follow GDPR/privacy regulations
4. **Backups**: Regular database backups
5. **Monitoring**: Set up security alerts

## Performance Optimization

1. **Images**: Use Next.js Image component
2. **Code Splitting**: Implement dynamic imports
3. **Caching**: Use SWR or React Query
4. **Database**: Optimize queries and indexes
5. **CDN**: Leverage Vercel's global CDN
