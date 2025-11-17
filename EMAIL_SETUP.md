# Email Setup for Contact Form

This document provides instructions for setting up email functionality for the contact form in the iRescue website.

## Overview

The contact form sends emails to the address specified in the `EMAIL_USER` environment variable. This means emails will be delivered to the same account that's used for sending.

## Email Provider Options

The system automatically detects which email provider to use based on the email address:

- **Gmail** (`@gmail.com`)
- **Outlook/Hotmail** (`@outlook.com`, `@hotmail.com`)
- **Yahoo** (`@yahoo.com`)
- **Other providers** (uses generic SMTP settings)

## Configuration Steps

### 1. Create Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Required for all email providers
EMAIL_USER=your-email@provider.com
EMAIL_PASSWORD=your-app-password

# Optional for custom SMTP setups
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

The `EMAIL_USER` will be used both as the sender and recipient of contact form submissions.

### 2. Gmail Setup (Recommended)

Gmail is recommended because it's easier to set up with app passwords:

1. Make sure 2-Step Verification is enabled on your Google account
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Under "App passwords", generate a new app password
4. Use this password as the `EMAIL_PASSWORD` in your `.env.local` file

### 3. Outlook/Microsoft 365 Setup

Microsoft has disabled basic authentication for security reasons. You have two options:

#### Option A: App Password (if available)

Some Microsoft accounts still support app passwords:

1. Go to [Microsoft Account Security](https://account.microsoft.com/security)
2. Sign in with your Microsoft account
3. Go to "Security" > "Advanced security options"
4. Under "App passwords", select "Create a new app password"
5. Copy the generated password and use it as the `EMAIL_PASSWORD` in your `.env.local` file

#### Option B: OAuth 2.0 Authentication (Advanced)

For more security and reliability:

1. Register an app in the [Azure Portal](https://portal.azure.com)
2. Configure OAuth 2.0 authentication for your email service
3. Set up the appropriate environment variables for OAuth client ID and secret

For more details, see Microsoft's documentation on [OAuth 2.0 and Microsoft Graph API](https://docs.microsoft.com/en-us/azure/active-directory/develop/active-directory-v2-protocols).

### 4. Testing the Contact Form

Once you've set up the environment variables:

1. Restart the development server
2. Go to the Contact page
3. Fill out and submit the form
4. Check that emails are being delivered to the configured email address

## Fallback Mechanism

If email sending fails, or if environment variables are not set, the system will use [Ethereal Email](https://ethereal.email/) as a fallback for testing. This creates a temporary email account and provides a preview URL in the server logs.

However, when deploying to production, **always configure the proper email credentials** to ensure messages are delivered reliably.

## Troubleshooting

### Authentication Issues

If you see errors like "Authentication unsuccessful" or "Invalid login":

1. **For Microsoft/Outlook accounts**:
   - Microsoft has disabled basic authentication for most accounts
   - Try using a Gmail account instead (recommended)
   - Or set up OAuth 2.0 authentication if you must use Outlook

2. **For Gmail accounts**:
   - Make sure 2-Step Verification is enabled
   - Generate an App Password (not your regular password)
   - Make sure "Less secure app access" is enabled if using an older Gmail account

3. **For other providers**:
   - Check if your email provider requires special settings
   - You may need to set `EMAIL_HOST`, `EMAIL_PORT`, and `EMAIL_SECURE` variables

### Other Issues

- Check the server logs for detailed error messages
- Ensure your email account hasn't exceeded sending limits
- Check if your email provider is blocking the connection
- Verify network connectivity and firewall settings

## Security Considerations

- Never commit your `.env.local` file to version control
- Regularly rotate your app passwords
- Consider using environment variables in your production deployment platform (Vercel, Netlify, etc.)
- For increased security, consider transitioning to OAuth 2.0 authentication 