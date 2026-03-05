# Fluxgram Deployment Guide

Complete guide to deploy Fluxgram to production.

## Prerequisites

1. GitHub account
2. Vercel account (free)
3. MongoDB Atlas account (free)
4. Two GitHub repositories:
   - Main repo (public): Your app code
   - Storage repo (private): For images

## Step 1: Setup GitHub Storage Repository

1. Create a new **PRIVATE** repository on GitHub
   - Name: `fluxgram-storage` (or any name)
   - Visibility: **Private**

2. Create folder structure in the repo:
   ```
   uploads/
     avatars/
     posts/
     stories/
   ```

3. Generate Personal Access Token:
   - Go to: https://github.com/settings/tokens/new
   - Name: `Fluxgram Storage`
   - Expiration: `No expiration` or `90 days`
   - Scope: Check `repo` (full control of private repositories)
   - Generate and copy the token (starts with `ghp_`)

## Step 2: Setup MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Whitelist all IPs: `0.0.0.0/0`
5. Get connection string (replace `<password>` with your password)

## Step 3: Deploy Backend to Vercel

1. Push your code to GitHub (main repo)

2. Go to https://vercel.com and import your repository

3. Configure project:
   - Framework Preset: `Other`
   - Root Directory: `backend`
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

4. Add Environment Variables in Vercel:
   ```
   PORT=3000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fluxgram
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NODE_ENV=production
   API_URL=https://your-backend.vercel.app
   GITHUB_OWNER=your-github-username
   GITHUB_REPO=fluxgram-storage
   GITHUB_TOKEN=ghp_your_token_here
   GITHUB_BRANCH=main
   ```

5. Deploy!

6. After deployment, copy your backend URL (e.g., `https://fluxgram-api.vercel.app`)

7. Update `API_URL` environment variable with your actual backend URL

## Step 4: Deploy Frontend to Vercel

1. In Vercel, import your repository again

2. Configure project:
   - Framework Preset: `Angular`
   - Root Directory: `fluxgram`
   - Build Command: `npm run build`
   - Output Directory: `dist/fluxgram/browser`

3. Add Environment Variables:
   ```
   NODE_ENV=production
   ```

4. Update `fluxgram/src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://your-backend.vercel.app/api'
   };
   ```

5. Commit and push changes

6. Deploy!

## Step 5: Update Backend API_URL

After frontend is deployed:

1. Go to your backend project in Vercel
2. Settings → Environment Variables
3. Update `API_URL` to your frontend URL: `https://your-app.vercel.app`
4. Redeploy backend

## Step 6: Test Everything

1. Visit your frontend URL
2. Register a new account with avatar
3. Create a post with images
4. Check your private GitHub repo - images should be there
5. Test all features

## Environment Variables Summary

### Backend (Vercel)
```env
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
NODE_ENV=production
API_URL=https://your-frontend.vercel.app
GITHUB_OWNER=your-username
GITHUB_REPO=fluxgram-storage
GITHUB_TOKEN=ghp_...
GITHUB_BRANCH=main
```

### Frontend (Vercel)
```env
NODE_ENV=production
```

## Important Notes

1. **GitHub Token Security**:
   - Never commit `.env` file
   - Keep token secret
   - Regenerate if exposed

2. **MongoDB**:
   - Whitelist all IPs for Vercel: `0.0.0.0/0`
   - Use strong password

3. **CORS**:
   - Backend already configured for all origins
   - Update if you want to restrict

4. **Image Storage**:
   - Images stored in private GitHub repo
   - Served through backend proxy
   - Not publicly accessible

5. **Vercel Limits (Free Tier)**:
   - 100GB bandwidth/month
   - 100 deployments/day
   - Serverless function timeout: 10s

## Troubleshooting

### Images not loading
- Check `API_URL` is set correctly
- Verify GitHub token has `repo` scope
- Check GitHub repo name is correct (case-sensitive)

### CORS errors
- Ensure backend `API_URL` matches frontend URL
- Check CORS is enabled in backend

### MongoDB connection failed
- Verify connection string
- Check IP whitelist includes `0.0.0.0/0`
- Ensure database user has correct permissions

### Build failed
- Check all dependencies are in `package.json`
- Verify Node version compatibility
- Check build logs in Vercel

## Custom Domain (Optional)

1. Go to Vercel project settings
2. Domains → Add domain
3. Follow DNS configuration steps
4. Update `API_URL` to use custom domain

## Monitoring

- Vercel Dashboard: View logs and analytics
- MongoDB Atlas: Monitor database usage
- GitHub: Check storage repo size

## Costs

- Vercel: Free (with limits)
- MongoDB Atlas: Free (512MB storage)
- GitHub: Free (private repos included)

Total: **$0/month** for small-medium usage!

## Support

For issues, check:
1. Vercel deployment logs
2. Browser console errors
3. Backend API responses
4. MongoDB connection status

---

**You're all set!** 🚀

Your Fluxgram app is now live with:
- ✅ Secure image storage (private GitHub repo)
- ✅ Scalable backend (Vercel serverless)
- ✅ Modern frontend (Angular)
- ✅ Database (MongoDB Atlas)
- ✅ Zero cost (free tier)
