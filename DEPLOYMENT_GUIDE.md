# GitHub & Vercel Deployment Guide

## Step 1: Push to GitHub

1. Open PowerShell and run:
```powershell
cd "d:\neural ai"
git remote add origin https://github.com/YOUR_USERNAME/neural-ai.git
git branch -M main
git push -u origin main
```

2. Replace `YOUR_USERNAME` with your actual GitHub username

3. Go to `https://github.com/YOUR_USERNAME/neural-ai` to verify

---

## Step 2: Set Up MongoDB Atlas (for production)

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string:
   - Click **Connect** → **Drivers**
   - Copy connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/neural-ai`)
5. Save this - you'll need it for Vercel

---

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub (recommended)
3. Click **New Project**
4. Select your `neural-ai` repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (default is fine)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. **Add Environment Variables:**
   - `MONGODB_URI` → Your MongoDB Atlas connection string
   - `GROQ_API_KEY` → Your Groq API key
   - `NODE_ENV` → `production`

7. Click **Deploy**

8. Wait 3-5 minutes for deployment
9. Your app will be live at `https://neural-ai-xyz.vercel.app`

---

## Step 4: Update Environment Variables After Deployment

If you need to add/update env vars later:
1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add or edit variables
4. Vercel will redeploy automatically

---

## Important Notes

- **Do NOT commit `.env` to GitHub** (already in .gitignore)
- Keep `GROQ_API_KEY` and `MONGODB_URI` secret
- First deployment might fail - check the logs in Vercel for errors
- Test locally first: `npm run dev`
- Vercel has a free tier (up to 3 deployments per day)

---

## Troubleshooting

### MongoDB Connection Error
- Check your MongoDB Atlas connection string
- Make sure your IP is whitelisted in MongoDB Atlas (0.0.0.0/0 for all IPs)

### Deployment Fails
- Check Vercel build logs
- Ensure all environment variables are set
- Verify TypeScript compiles: `npm run check`

### Chat/API Not Working
- Check browser console for errors
- Check Vercel function logs
- Verify environment variables are correct

