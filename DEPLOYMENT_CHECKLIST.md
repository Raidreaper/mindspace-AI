# Deployment Checklist for MindSpace AI

## ✅ What's Fixed
- Build configuration optimized with proper chunking
- React Icons dependency installed
- Asset paths configured correctly for Vercel
- Google OAuth authentication implemented
- Email/password forms removed

## 🔧 Vercel Environment Variables Required

Set these in your Vercel project dashboard → Settings → Environment Variables (use your real values, do not commit them):

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🌐 Supabase Configuration Required

### 1. Google OAuth Provider
- Go to Supabase Dashboard → Authentication → Providers → Google
- Enable Google provider
- Client ID: `<your_google_client_id>`
- Client Secret: `<your_google_client_secret>`

### 2. Auth URLs
- Site URL: `https://mindspace-ai.vercel.app`
- Additional Redirect URLs:
  ```
  https://mindspace-ai.vercel.app
  https://mindspace-ai.vercel.app/*
  http://localhost:3000
  http://localhost:5173
  ```

### 3. CORS Origins
- API → Settings → Allowed CORS Origins:
  ```
  https://mindspace-ai.vercel.app
  http://localhost:3000
  http://localhost:5173
  ```

## 🔑 Google Cloud Console Configuration

### OAuth Consent Screen
- Complete and publish (at least for testing)

### Credentials → Web Client
- Authorized redirect URIs:
  ```
  https://iqecoplqznbfxwumxaew.supabase.co/auth/v1/callback
  ```
- Authorized JavaScript origins:
  ```
  https://mindspace-ai.vercel.app
  http://localhost:3000
  http://localhost:5173
  ```

## 🚀 Deployment Steps

1. **Push changes to GitHub**
2. **Set environment variables in Vercel**
3. **Redeploy** (Vercel should auto-deploy on push)
4. **Test Google sign-in**

## 🐛 Common Issues & Solutions

### App shows blank page
- Check browser console for errors
- Verify environment variables are set in Vercel
- Ensure Supabase Google OAuth is configured

### Google sign-in fails
- Verify redirect URLs in Supabase
- Check Google Cloud Console OAuth settings
- Ensure CORS origins are correct

### Build fails
- Check for missing dependencies
- Verify TypeScript compilation
- Check for environment variable references

## 📱 Testing

1. **Local test**: `npm run build && npx serve dist -p 3000`
2. **Deployed test**: Visit https://mindspace-ai.vercel.app
3. **Auth flow**: Click "Continue with Google"

## 🔍 Debug Commands

```bash
# Build project
npm run build

# Test build locally
npx serve dist -p 3000

# Check for TypeScript errors
npx tsc --noEmit

# Check for linting issues
npm run lint
```

## 📞 Next Steps

After setting up the environment variables and Supabase configuration:
1. Redeploy on Vercel
2. Test the Google sign-in flow
3. Verify the app loads correctly
4. Check browser console for any remaining errors
