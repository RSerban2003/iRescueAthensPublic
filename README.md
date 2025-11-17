# iRescue - Phone Repair & Service App

iRescue is a comprehensive mobile phone repair and service application that allows users to:

- Schedule phone repairs
- Purchase refurbished devices
- Sell their used devices
- Manage repair bookings and track status

## Features

- **Repair Service:** Schedule repair appointments for various phone issues
- **Purchase Section:** Browse and buy refurbished phones
- **Sell Your Device:** Get quotes and sell your used phones
- **Admin Dashboard:** Manage repair requests, inventory, and bookings
- **Secure Authentication:** User accounts and admin access
- **Payment Integration:** Secure online payments with Stripe
- **Responsive Design:** Works on mobile, tablet, and desktop
- **Admin Notifications:** Receive notifications for new requests

## Technologies

- Next.js 15+
- React 19
- Prisma ORM
- PostgreSQL Database
- NextAuth.js
- Stripe Payment Integration
- Tailwind CSS
- TypeScript

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables (see below)
4. Set up the database: `npm run db-setup`
5. Run the development server: `npm run dev`

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@hostname:port/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Stripe
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"

# Time slots
AVAILABLE_TIME_SLOTS="10:00-10:30,10:30-11:00,11:00-11:30,11:30-12:00,12:00-12:30,12:30-13:00,13:00-13:30,13:30-14:00,14:00-14:30,14:30-15:00,15:00-15:30,15:30-16:00,16:00-16:30,16:30-17:00,17:00-17:30,17:30-18:00,18:00-18:30,18:30-19:00,19:00-19:30,19:30-20:00"

# Admin email for notifications
ADMIN_EMAIL=your_admin_email@example.com
EMAIL_PASSWORD=your_email_password

# Site URL for admin links in emails
NEXT_PUBLIC_SITE_URL=https://your-website.com
```

## Admin Setup

Run the admin setup script to create an admin user:

```bash
npm run create-admin
```

## Database Setup

The application uses PostgreSQL for production deployment. Follow these steps to set up your database:

1. Create a PostgreSQL database on your preferred hosting provider (e.g., Vercel, Supabase, Neon, etc.)
2. Update your `.env` file with the PostgreSQL connection string
3. Run the database setup script: `npm run db-setup`

To test your database connection:

```bash
node src/lib/db-test.mjs
```

## Deployment

The app is configured for easy deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Configure the following environment variables in Vercel:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - Secret key for JWT authentication
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe public key
   - `STRIPE_SECRET_KEY` - Stripe secret key
   - Other variables from `.env.production`

3. Deploy the application with:
```bash
vercel --prod
```

The deployment process will automatically:
1. Fix any SQLite migrations to be PostgreSQL compatible
2. Set up the database schema if needed
3. Generate the Prisma client
4. Build and deploy the application

## Email Notifications

The website sends email notifications to the administrator (configured in `.env.local`) for the following events:

1. **Contact Form Submissions** - When a customer submits the contact form
2. **Repair Requests** - When a customer books a repair service
3. **Phone Purchases** - When a customer buys a phone
4. **New Phone Listings** - When a customer lists a phone for sale

The emails contain all relevant information and link to the admin dashboard for further action.

### Email Configuration

- The system automatically detects the email provider based on the ADMIN_EMAIL (Gmail, Outlook, Yahoo, etc.)
- For Gmail, you might need to enable "Less secure app access" or use an app password
- For Outlook, consider using an app password as Microsoft has disabled basic authentication
- If you use a different email provider, you can specify custom SMTP settings using the optional variables

## License

This project is licensed under the MIT License.

# Vercel Deployment Troubleshooting

If you encounter issues deploying to Vercel, try the following:

## Common Issues and Solutions

### Database URL Issues (Most Common)

The most common problem is that Vercel needs the DATABASE_URL environment variable during runtime, but not during build time. We've solved this by:

1. Using a dummy DATABASE_URL in .env.production for the build
2. Skipping migrations during the build process
3. Running migrations separately after deployment (via our post-build script)

### To Fix Database Issues:

1. **Check Your Environment Variables in Vercel Dashboard**:
   - Go to Project Settings > Environment Variables
   - Make sure DATABASE_URL is correctly set with the format:
   ```
   postgresql://postgres.user:password@host:5432/postgres?pgbouncer=true&connection_limit=1
   ```

2. **Run Migrations Manually** (if needed):
   ```bash
   # Pull Vercel environment variables
   vercel env pull
   
   # Then run migrations
   npm run deploy-migrations
   ```

### Node.js Version

Make sure Vercel is using Node.js 18.x (we've added `.nvmrc` and engine specification)

### Environment Variables

Make sure the following environment variables are correctly set in Vercel:

- `DATABASE_URL` - Your Supabase PostgreSQL connection string
- `NEXTAUTH_SECRET` 
- `NEXTAUTH_URL` (set to your Vercel deployment URL)
- `JWT_SECRET`
- `EMAIL_USER` 
- `EMAIL_PASSWORD` (App Password for Gmail)
- `NEXT_PUBLIC_APP_URL` (your Vercel deployment URL)

### Manual Deployment Steps

If automatic GitHub deployment doesn't work, try deploying manually:

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy from your project root: `vercel --prod`

See the full deployment guide in [DEPLOYMENT.md](./DEPLOYMENT.md)
