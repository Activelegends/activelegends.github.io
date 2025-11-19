# Cloudflare Workers Auth Deployment Guide

This guide explains how to deploy the custom Google OAuth authentication system to Cloudflare Workers.

## Prerequisites

1. Cloudflare account with Workers enabled
2. Cloudflare D1 database created
3. Google OAuth credentials (Client ID and Client Secret)
4. Wrangler CLI installed: `npm install -g wrangler`

## Step 1: Create D1 Database

```bash
# Create a new D1 database
wrangler d1 create activelegend-db

# Note the database_id from the output
# Update wrangler.toml with the database_id
```

## Step 2: Run Database Migration

```bash
# Apply the schema
wrangler d1 execute activelegend-db --file=./workers/schema.sql
```

## Step 3: Set Environment Secrets

```bash
# Set Google OAuth credentials
wrangler secret put GOOGLE_CLIENT_ID
# Enter your Google Client ID when prompted

wrangler secret put GOOGLE_CLIENT_SECRET
# Enter your Google Client Secret when prompted

# Set JWT secret (use a strong random string)
wrangler secret put JWT_SECRET
# Enter a strong random string (at least 32 characters)
```

## Step 4: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URI: `https://activelegend.ir/api/auth/callback/google`
6. Copy Client ID and Client Secret

## Step 5: Update wrangler.toml

Update `wrangler.toml` with your D1 database ID:

```toml
[[env.production.d1_databases]]
binding = "DB"
database_name = "activelegend-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

## Step 6: Deploy Worker

```bash
# Deploy to production
wrangler deploy --env production
```

## Step 7: Configure Cloudflare Pages Functions

If using Cloudflare Pages, you need to add the Worker as a Function:

1. Go to Cloudflare Dashboard → Pages → Your Site
2. Go to Functions → Add Function
3. Route pattern: `/api/auth/*`
4. Worker: `activelegend-auth`

Alternatively, you can use Cloudflare Workers Routes:

1. Go to Workers & Pages → Routes
2. Add route: `activelegend.ir/api/auth/*`
3. Select worker: `activelegend-auth`

## Step 8: Update Frontend Environment Variables

Add to your `.env` file:

```env
VITE_API_URL=https://activelegend.ir
```

Or if using a different domain for the API:

```env
VITE_API_URL=https://api.activelegend.ir
```

## Step 9: Test the Deployment

1. Visit `https://activelegend.ir`
2. Click "Login with Google"
3. Complete OAuth flow
4. Verify you're redirected back and logged in

## Troubleshooting

### Issue: "Not authenticated" errors

- Check that cookies are being set (check browser DevTools → Application → Cookies)
- Verify JWT_SECRET is set correctly
- Check Worker logs: `wrangler tail`

### Issue: OAuth callback fails

- Verify redirect URI matches exactly in Google Console
- Check that the callback route is properly configured
- Review Worker logs for errors

### Issue: Database errors

- Verify D1 database is created and bound correctly
- Check that schema migration ran successfully
- Ensure database_id in wrangler.toml is correct

## Monitoring

Monitor your Worker:

```bash
# View real-time logs
wrangler tail

# View analytics
wrangler deployments list
```

## Security Notes

1. **JWT Secret**: Use a strong, random string (at least 32 characters)
2. **HTTPS Only**: Ensure all cookies are Secure (only sent over HTTPS)
3. **SameSite**: Set to Lax to prevent CSRF attacks
4. **HttpOnly**: Prevents XSS attacks by blocking JavaScript access to cookies

## Production Checklist

- [ ] D1 database created and migrated
- [ ] All secrets set in Wrangler
- [ ] Google OAuth configured with correct redirect URI
- [ ] Worker deployed to production
- [ ] Routes configured correctly
- [ ] Frontend environment variables set
- [ ] Tested login flow end-to-end
- [ ] Tested logout flow
- [ ] Verified cookies are set correctly
- [ ] Checked Worker logs for errors
