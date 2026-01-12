# Frontend Deployment Fix - API URL Configuration

## 🔧 Problem Fixed

Your frontend was trying to connect to `http://localhost:8000` instead of `https://api.mrdsphub.in/api` when deployed to S3.

## ✅ What Was Changed

1. **Created `.env.production`** file with correct API URL
2. **Updated API detection logic** in `api.ts` to handle production deployments
3. **Updated error message** to be more generic (not hardcoded to localhost)

## 🚀 How to Deploy the Fix

### Step 1: Rebuild Frontend with Production Environment

```bash
cd /home/dinesh/DSP_STORE/DSP_STORE/frontend

# Make sure .env.production exists and has correct URL
cat .env.production
# Should show: VITE_API_BASE_URL=https://api.mrdsphub.in/api

# Clean previous build
rm -rf dist/

# Build for production (this will use .env.production)
npm run build
```

### Step 2: Upload to S3

**Option A: Using AWS CLI**
```bash
# Make sure AWS CLI is configured
aws configure

# Upload to S3
aws s3 sync dist/ s3://mrdsphub-frontend/ --delete

# Or if using CloudFront, invalidate cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

**Option B: Manual Upload**
1. Go to AWS Console → S3 → `mrdsphub-frontend` bucket
2. Delete all existing files
3. Upload all files from `frontend/dist/` folder
4. Go to CloudFront → Your Distribution → Create Invalidation → `/*`

### Step 3: Verify

1. Visit your site: `https://mrdsphub.in` (or your S3/CloudFront URL)
2. Open browser DevTools (F12) → Network tab
3. Check API calls - they should go to `https://api.mrdsphub.in/api`
4. Products should load successfully!

## 📝 Environment Files Explained

### `.env.production` (Production Build)
```env
VITE_API_BASE_URL=https://api.mrdsphub.in/api
```
- Used when running `npm run build`
- This file is in `.gitignore` (not committed to Git)
- **You must create this file on your local machine before building**

### `.env` (Development)
```env
VITE_API_BASE_URL=http://localhost:8000/api
```
- Used when running `npm run dev`
- For local development only

### `.env.example` (Template)
- Example file showing what environment variables are needed
- Safe to commit to Git

## 🔍 How It Works Now

The API service (`api.ts`) now:

1. **First Priority**: Uses `VITE_API_BASE_URL` from environment file
   - Development: `.env` → `http://localhost:8000/api`
   - Production: `.env.production` → `https://api.mrdsphub.in/api`

2. **Second Priority**: Auto-detects production environment
   - If hostname is `mrdsphub.in` or `*.cloudfront.net` → uses `https://api.mrdsphub.in/api`
   - If hostname is S3 bucket → uses `https://api.mrdsphub.in/api`

3. **Fallback**: Defaults to `http://localhost:8000/api` for development

## ⚠️ Important Notes

1. **Always rebuild after changing `.env.production`**
   - Environment variables are embedded at build time
   - Just uploading new files won't work - you must rebuild

2. **Check your build output**
   ```bash
   # After building, check the built files
   grep -r "localhost:8000" dist/
   # Should return nothing (no localhost references)
   
   grep -r "api.mrdsphub.in" dist/
   # Should show the correct API URL
   ```

3. **CloudFront Cache**
   - After uploading, create a CloudFront invalidation
   - This ensures users get the new version immediately

## 🐛 Troubleshooting

### Issue: Still seeing localhost:8000 errors

**Solution:**
1. Check `.env.production` exists and has correct URL
2. Delete `dist/` folder completely
3. Rebuild: `npm run build`
4. Verify: `grep -r "api.mrdsphub.in" dist/` should show results
5. Re-upload to S3
6. Invalidate CloudFront cache

### Issue: CORS errors

**Solution:**
- Make sure backend `.env` has:
  ```
  CORS_ALLOWED_ORIGINS=https://mrdsphub.in,https://www.mrdsphub.in,https://*.mrdsphub.in
  ```
- Restart backend: `sudo systemctl restart mrdsphub-backend`

### Issue: API calls going to wrong URL

**Solution:**
- Check browser console for actual API URL being used
- Verify `.env.production` file content
- Rebuild and re-upload

## ✅ Verification Checklist

- [ ] `.env.production` file exists with `VITE_API_BASE_URL=https://api.mrdsphub.in/api`
- [ ] Built frontend with `npm run build`
- [ ] Verified `dist/` folder has no `localhost:8000` references
- [ ] Uploaded to S3
- [ ] Created CloudFront invalidation
- [ ] Tested site - products load successfully
- [ ] Browser DevTools shows API calls to `https://api.mrdsphub.in/api`

---

**After following these steps, your frontend should connect to the live backend!** 🎉
