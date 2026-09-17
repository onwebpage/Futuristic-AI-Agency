# Render Environment Setup for Authentication Fix

## Problem Diagnosed

The "Unregistered API key" error during signup occurs because the Supabase client was falling back to `VITE_SUPABASE_PUBLISHABLE_KEY` (an anon key) instead of using the service role key. The anon key has limited Row Level Security permissions and cannot create users server-side.

## Root Cause

In `lib/db/src/index.ts`, the Supabase client initialization had this priority:
```typescript
// OLD (INCORRECT)
const supabaseKey = 
  process.env.SUPABASE_SECRET_KEY || 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || // ❌ WRONG - This is anon key!
  "";
```

If `SUPABASE_SECRET_KEY` was not set in Render, it would fall back to the publishable (anon) key, which lacks the permissions to create users.

## Fix Applied

1. **Removed fallback to anon key** - Never use `VITE_SUPABASE_PUBLISHABLE_KEY` for backend operations
2. **Added comprehensive validation** - Server now validates environment at startup
3. **Enhanced error logging** - Clear messages identify configuration issues
4. **Documentation** - Updated `.env.example` with detailed instructions

## Required Action for Render

### 1. Get Your Supabase Service Role Key

1. Go to https://app.supabase.com/project/gkcmdngzatpdrzfdahcq/settings/api
2. Find the **"service_role" key** (NOT the "anon" key)
3. It should start with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.`
4. Copy the FULL key (it's quite long, ~150+ characters)

### 2. Set Environment Variables in Render

In your Render dashboard, set these environment variables:

**Required:**
```bash
# Supabase Configuration
SUPABASE_URL=https://gkcmdngzatpdrzfdahcq.supabase.co
SUPABASE_SECRET_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJl...YOUR_FULL_SERVICE_ROLE_KEY_HERE

# JWT Secrets (generate strong random strings)
SESSION_SECRET=<generate-a-strong-random-string-at-least-32-chars>
USER_SESSION_SECRET=<generate-a-strong-random-string-at-least-32-chars>

# Server Configuration
PORT=4317
NODE_ENV=production
```

**Optional but Recommended:**
```bash
# CORS (comma-separated list of allowed origins)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# PayPal (if using payments)
PAYPAL_CLIENT_ID=<your-paypal-client-id>
PAYPAL_CLIENT_SECRET=<your-paypal-client-secret>
PAYPAL_MODE=live
```

### 3. Generate Strong JWT Secrets

For `SESSION_SECRET` and `USER_SESSION_SECRET`, use strong random strings. You can generate them with:

**Option 1 - Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Option 2 - PowerShell:**
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Option 3 - Online:**
Visit https://www.random.org/strings/ and generate a 32+ character random string

### 4. DO NOT Set These (Frontend Only)

These variables are for frontend builds only and should NOT be in your Render API server environment:
- ❌ `VITE_SUPABASE_PUBLISHABLE_KEY` 
- ❌ `VITE_SUPABASE_URL` (can be set but not used by backend)

## Verification

After deploying with correct environment variables, you should see in the Render logs:

```
✅ Environment configuration validated successfully
[Supabase] Initialized with URL: https://gkcmdngzatpdrzfdahcq.supabase.co
[Supabase] Using key from: SUPABASE_SECRET_KEY
[Supabase] Key format check: JWT format (service_role)
```

If you see errors, the validation will clearly indicate what's wrong:

```
❌ ENVIRONMENT CONFIGURATION ERRORS
================================================================================
1. Supabase service role key is required. Set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY
2. SUPABASE_SECRET_KEY should start with 'eyJ' (JWT format)
================================================================================
🛑 Server cannot start with configuration errors.
```

## Testing Signup After Fix

Once deployed with correct environment variables, test signup:

```bash
curl -X POST https://your-app.onrender.com/api/user/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "fullName": "Test User",
    "accountType": "USER"
  }'
```

Expected response (success):
```json
{
  "token": "eyJhbGc...",
  "profile": {
    "id": "uuid-here",
    "email": "test@example.com",
    "fullName": "Test User",
    ...
  }
}
```

## Common Issues

### Issue: "Unregistered API key"
**Solution:** You're using the wrong Supabase key. Make sure you're using the **service_role** key, not the **anon** key.

### Issue: "USER_SESSION_SECRET must be set in production"
**Solution:** Set the `USER_SESSION_SECRET` environment variable in Render with a strong random string.

### Issue: "Invalid Supabase URL format"
**Solution:** URL should be `https://your-project-id.supabase.co` (with https and .supabase.co domain)

### Issue: Server won't start after deployment
**Solution:** Check Render logs for validation errors. The server will print exactly what's misconfigured.

## Security Notes

1. **Never commit** `.env` to git - it's in `.gitignore`
2. **Rotate secrets** if they're ever exposed
3. **Service role key** has full database access - keep it secret
4. **Anon/publishable key** is for frontend only - it's safe to expose but doesn't work for backend operations
5. Use different secrets for development and production

## Files Changed in This Fix

- `lib/db/src/index.ts` - Fixed Supabase client initialization
- `artifacts/api-server/src/routes/user.ts` - Enhanced error logging
- `artifacts/api-server/src/lib/validate-env.ts` - New validation module
- `artifacts/api-server/src/index.ts` - Added startup validation
- `.env.example` - Updated documentation

## Support

If issues persist after following this guide:
1. Check Render logs for the exact error message
2. Verify all environment variables are set correctly
3. Ensure you copied the FULL service_role key (it's very long)
4. Check that key starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.`
