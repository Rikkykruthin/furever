# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your FurEver application.

## Step 1: Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in the required information (App name, User support email, Developer contact)
   - Add scopes: `email` and `profile`
   - Add test users if needed (for development)
6. Create OAuth client ID:
   - Application type: **Web application**
   - Name: `FurEver Web Client`
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (for development)
     - `https://yourdomain.com/api/auth/google/callback` (for production)
7. Copy the **Client ID** and **Client Secret**

## Step 2: Configure Environment Variables

Add the following to your `.env.local` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_USER_SECRET=your_jwt_secret_here
```

For production, update `NEXT_PUBLIC_APP_URL` to your production domain.

## Step 3: Fix Database Index (One-time setup)

If you encounter a duplicate key error on the `name` field, you need to drop the unique index:

```bash
npm run fix-name-index
```

This will remove the unique constraint on the `name` field, allowing multiple users to have the same name (which is normal).

## Step 4: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click the "Continue with Google" button
4. You should be redirected to Google's sign-in page
5. After signing in, you'll be redirected back to your app

## Features

- ✅ Google Sign-In for Users and Sellers (Admin accounts cannot use Google login)
- ✅ Automatic account creation for new users
- ✅ Linking Google accounts to existing email accounts
- ✅ Profile picture sync from Google
- ✅ Seamless integration with existing authentication system

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/api/auth/google/callback`
- Check that `NEXT_PUBLIC_APP_URL` matches your current domain

### Error: "invalid_client"
- Verify that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correctly set in `.env.local`
- Make sure there are no extra spaces or quotes

### Error: "access_denied"
- User cancelled the Google sign-in process
- Check OAuth consent screen configuration

### User already exists error
- If a user tries to sign in with Google but their email already exists with a password, the accounts will be linked
- If the email exists with a different Google account, an error will be shown

### Duplicate key error on name field
- If you see `E11000 duplicate key error collection: furever.users index: name_1`, run `npm run fix-name-index` to drop the unique index
- The code now automatically handles name conflicts by appending a random number if needed

## Security Notes

- Never commit `.env.local` to version control
- Keep your `GOOGLE_CLIENT_SECRET` secure
- Use HTTPS in production
- Regularly rotate your OAuth credentials

