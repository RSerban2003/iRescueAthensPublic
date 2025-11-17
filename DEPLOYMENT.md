# Deploying to Vercel

This guide walks you through deploying your iRescue application to Vercel.

## Prerequisites

- A [Vercel](https://vercel.com) account
- A [Supabase](https://supabase.com) account (for PostgreSQL database)
- A Gmail account with App Password configured

## Step 1: Create Environment Variables in Vercel

Before deploying, you'll need to add the following environment variables in your Vercel project settings:

| Variable Name | Description | Example |
|--------------|-------------|---------|
| `DATABASE_URL` | Your Supabase PostgreSQL connection string | `postgres://postgres.ehvsszvqgdylkcickfyn:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Same as your JWT_SECRET |
| `NEXTAUTH_URL` | Your production URL | `https://irescueathens.vercel.app` |
| `JWT_SECRET` | Secret for JWT tokens | Your secure JWT secret |
| `EMAIL_USER` | Gmail address for sending notifications | `irescueathens@gmail.com` |
| `EMAIL_PASSWORD` | Gmail App Password (NOT your regular password) | Your 16-character app password |
| `NEXT_PUBLIC_APP_URL` | Public URL for your application | `https://irescueathens.vercel.app` |

## Step 2: Configure Gmail App Password (Important!)

1. Go to your [Google Account Security settings](https://myaccount.google.com/security)
2. Make sure 2-Step Verification is enabled
3. Then go to "App passwords"
4. Create a new App password (select "Mail" and "Other" and name it "iRescue")
5. Copy the 16-character password that Google generates
6. Use this as your `EMAIL_PASSWORD` in Vercel environment variables

## Step 3: Install Required Dependencies

Before deploying, make sure all required dependencies are installed:

```bash
# Install Critters for CSS optimization
npm install critters --save-dev

# Install any other missing dependencies
npm install
```

## Step 4: Deploy to Vercel

You can deploy in several ways:

### Option 1: Direct from GitHub

1. Connect your GitHub repository to Vercel
2. Configure the build settings:
   - Build Command: `npm run vercel-build`
   - Output Directory: `.next`
3. Add the environment variables listed above
4. Deploy!

### Option 2: Using Vercel CLI

1. Install Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Run deployment: `vercel --prod`

## Step 5: Verify Database Connection

After deployment:

1. Go to your Vercel project dashboard
2. Check logs to ensure database connection is successful
3. If there are database issues, verify that:
   - Your Supabase database is accessible from external services
   - The connection string is correctly formatted
   - IP restrictions are properly configured

## Step 6: Set up Email Monitoring

Since emails are critical for your application:

1. Test the contact form after deployment
2. Monitor the Gmail account for delivery issues
3. Check Vercel logs for any email-related errors

## Troubleshooting

### Email Issues

- **Authentication Errors**: Make sure you're using an App Password, not your regular Gmail password
- **Sending Limit**: Gmail has daily sending limits - consider upgrading to a business email solution for high volume

### Database Issues

- **Connection Errors**: Check if your IP is whitelisted in Supabase
- **Migration Errors**: The `prisma generate` command should handle this automatically, but manually apply migrations if needed

### Deployment Failures

- **Build Errors**: Check Vercel logs for details
- **Environment Variables**: Make sure all required variables are set correctly
- **Missing Dependencies**: If you encounter errors about missing packages, install them locally before deploying

### Common Build Issues

If you encounter build errors related to optimization features:

1. **CSS Optimization Errors**: Make sure `critters` is installed
2. **SWC Minify Errors**: Remove `swcMinify: true` from next.config.js as it's not needed in Next.js 15+
3. **Experimental Features**: Some experimental features may not be supported in the latest Next.js version

## Performance Optimizations

Your deployment is already optimized with:

- Proper caching headers for static assets
- Server-side rendering for main pages
- Security headers for protection

For additional performance:

1. Consider enabling Vercel Edge Functions for faster global response times
2. Use Vercel Analytics to monitor performance metrics
3. Enable Vercel's Image Optimization API for better image loading

# Important Note About Database Deployment

In the Vercel deployment process, the build phase happens in an isolated environment where environment variables from the Vercel dashboard are **not available**. This means that `DATABASE_URL` and other environment variables aren't available during the build.

We've configured the project to handle this by:

1. Using a dummy `DATABASE_URL` in `.env.production` for the build phase
2. Skipping database migrations during the build phase
3. Running migrations in a post-deploy hook when the real `DATABASE_URL` is available

## Vercel Environment Variable Setup

When setting up your project in Vercel, make sure to add all environment variables in the Vercel dashboard:

1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add all required variables:
   - `DATABASE_URL` (your actual Supabase PostgreSQL connection string)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (should be your Vercel deployment URL)
   - `JWT_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `NEXT_PUBLIC_APP_URL`

## Troubleshooting Database Connection Issues

If your database isn't connecting after deployment:

1. Verify the format of your `DATABASE_URL` environment variable
2. Make sure your database allows connections from Vercel's IP ranges
3. Add `?connection_limit=1` to your database URL if using Supabase
4. Add `?schema=public` if your database requires a specific schema

Example DATABASE_URL format for Supabase:
```
postgresql://postgres.user:password@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&schema=public
```

## Manual Database Migration

If automatic migrations aren't working, you can manually apply them:

1. Install the Vercel CLI: `npm i -g vercel`
2. Log in: `vercel login`
3. Pull environment variables: `vercel env pull`
4. Run migrations manually: `npx prisma migrate deploy`
5. Deploy again: `vercel --prod` 