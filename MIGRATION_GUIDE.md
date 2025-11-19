# Migration Guide: Supabase Auth → Cloudflare Workers OAuth

This guide documents the migration from Supabase Auth to a custom Google OAuth system running on Cloudflare Workers.

## Overview

The authentication system has been completely replaced:
- **Old**: Supabase Auth with email/password and OAuth
- **New**: Custom Google OAuth with Cloudflare Workers + D1 + JWT

## What Changed

### Backend (Cloudflare Workers)
- ✅ Custom OAuth flow with Google Identity Services
- ✅ JWT token generation using WebCrypto
- ✅ D1 database for user storage
- ✅ HttpOnly, Secure cookies for session management

### Frontend
- ✅ New `src/lib/auth.ts` utility functions
- ✅ Updated `AuthContext` to use new auth system
- ✅ Removed email/password login (Google OAuth only)
- ✅ Updated all components to use new user structure

## User Object Structure

### Old (Supabase)
```typescript
{
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    avatar_url: string;
  };
  app_metadata: {
    provider: string;
  };
}
```

### New (Custom)
```typescript
{
  id: string;
  email: string;
  name: string;
  picture: string;
}
```

## Component Updates

### AuthContext
- Removed: `signIn`, `signUp`, `session`
- Added: `refreshUser()`
- Changed: `signInWithGoogle()` now redirects directly (no options needed)

### AuthModal
- Removed: Email/password form
- Kept: Google OAuth button only
- Simplified: Terms acceptance required before OAuth

### UserAvatar
- Changed: Uses `user.picture` instead of `user.user_metadata.avatar_url`
- Changed: Uses `user.name` instead of `user.user_metadata.full_name`

### FavoriteButton
- Changed: Uses `user.id` from context instead of `session.user.id`

### Comments
- Changed: Uses `user.id` from context instead of `session.user.id`
- Removed: Supabase metadata sync logic

### Games/MyGames/GameDetail
- Changed: Admin check uses `user?.email` directly

## API Endpoints

### `/api/auth/login/google`
- Redirects to Google OAuth
- Sets state cookie for CSRF protection

### `/api/auth/callback/google`
- Handles OAuth callback
- Creates/updates user in D1
- Sets JWT session cookie
- Redirects to homepage

### `/api/auth/me`
- Returns current user from JWT
- Requires valid session cookie

### `/api/auth/logout`
- Clears session cookie
- Returns success response

## Environment Variables

### Required
```env
VITE_API_URL=https://activelegend.ir
```

### Cloudflare Workers Secrets
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET`

## Database Schema

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  picture TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## Breaking Changes

1. **No Email/Password Login**: Only Google OAuth is supported
2. **No Session Object**: Use `user` directly from context
3. **User Structure**: Different property names (see above)
4. **No Real-time Auth**: Auth state changes require manual refresh

## Migration Steps for Existing Users

If you have existing Supabase users, you'll need to:

1. Export user data from Supabase
2. Migrate to D1 database
3. Map old user IDs to new UUIDs
4. Update any foreign key references

## Testing Checklist

- [ ] Google OAuth login flow works
- [ ] User data persists in D1
- [ ] JWT tokens are valid and expire correctly
- [ ] Logout clears session
- [ ] Protected routes work correctly
- [ ] User avatar displays correctly
- [ ] Favorites system works
- [ ] Comments system works
- [ ] Admin checks work correctly

## Rollback Plan

If you need to rollback:

1. Restore Supabase Auth code from git history
2. Revert component changes
3. Update environment variables
4. Deploy previous version

## Support

For issues or questions:
1. Check Cloudflare Worker logs: `wrangler tail`
2. Check browser console for frontend errors
3. Verify cookies are being set correctly
4. Check D1 database for user records
