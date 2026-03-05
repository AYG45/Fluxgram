# Quick Vercel Setup

## 1. Backend Deployment

```bash
cd backend
vercel
```

**Environment Variables (add in Vercel dashboard):**
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - Random secret key (generate with: `openssl rand -base64 32`)
- `NODE_ENV` - Set to `production`

## 2. Frontend Deployment

**First, update API URL:**

Edit `fluxgram/src/app/services/api.service.ts`:
```typescript
private apiUrl = 'https://your-backend-url.vercel.app/api';
```

**Then deploy:**
```bash
cd fluxgram
npm run build
vercel
```

## 3. Important: File Storage

⚠️ **Vercel's serverless functions don't persist files between deployments.**

For production, replace local file storage with cloud storage:

### Option 1: Vercel Blob (Recommended)
```bash
npm install @vercel/blob
```

### Option 2: Cloudinary
```bash
npm install cloudinary
```

### Option 3: AWS S3
```bash
npm install aws-sdk
```

## 4. MongoDB Atlas Setup

1. Create cluster at https://cloud.mongodb.com
2. Database Access → Add user
3. Network Access → Add IP: `0.0.0.0/0` (allow all)
4. Get connection string
5. Replace `<password>` with your actual password

## 5. Test Deployment

1. Register a new user
2. Login
3. Create a post
4. Test all features

## Common Issues

**CORS Error:**
Add your frontend URL to backend CORS:
```javascript
app.use(cors({
  origin: 'https://your-frontend.vercel.app'
}));
```

**MongoDB Connection Failed:**
- Check connection string
- Verify IP whitelist (0.0.0.0/0)
- Ensure user has read/write permissions

**Images Not Loading:**
- This is expected on Vercel (serverless)
- Implement cloud storage solution

## Production Checklist

- [ ] MongoDB Atlas configured
- [ ] Backend deployed to Vercel
- [ ] Environment variables set
- [ ] Frontend API URL updated
- [ ] Frontend deployed to Vercel
- [ ] CORS configured
- [ ] All features tested
- [ ] Cloud storage implemented (for production use)
