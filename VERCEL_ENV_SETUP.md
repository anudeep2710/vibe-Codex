# Vercel Environment Variables Setup

## Required Environment Variables

Add these in the Vercel Dashboard → Project Settings → Environment Variables:

### Gemini API Keys (Multi-Key Rotation)
```
VITE_GEMINI_API_KEY_1=your_first_gemini_key
VITE_GEMINI_API_KEY_2=your_second_gemini_key
VITE_GEMINI_API_KEY_3=your_third_gemini_key
VITE_GEMINI_API_KEY_4=your_fourth_gemini_key
VITE_GEMINI_API_KEY_5=your_fifth_gemini_key
VITE_GEMINI_API_KEY_6=your_sixth_gemini_key
VITE_GEMINI_API_KEY_7=your_seventh_gemini_key
VITE_GEMINI_API_KEY_8=your_eighth_gemini_key
VITE_GEMINI_API_KEY_9=your_ninth_gemini_key
```

### Supabase Configuration
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How to Add in Vercel Dashboard

1. Go to your project on Vercel
2. Click **Settings**
3. Click **Environment Variables**
4. Add each variable:
   - **Key:** `VITE_GEMINI_API_KEY_1`
   - **Value:** `[paste your first API key]`
   - **Environment:** Select all (Production, Preview, Development)
5. Repeat for all 11 variables
6. Click **Save**

## Copy from .env.local

You can copy the values from your local `.env.local` file:

**Windows PowerShell:**
```powershell
Get-Content .env.local
```

**Windows Command Prompt:**
```cmd
type .env.local
```

Then copy each value to Vercel dashboard.

## After Adding Variables

1. Go to **Deployments**
2. Click the **...** menu on latest deployment
3. Click **Redeploy**
4. Your app will build with the environment variables!

## Verification

After deployment, check browser console:
- Should see "Using Gemini API key 1 of 9" in console
- No errors about missing API keys
- Multi-key rotation working
