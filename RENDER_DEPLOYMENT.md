# Render Deployment Guide for Anonymous Feedback Portal

## 🎯 Overview
- **Backend API**: Node.js/Express on Render
- **Frontend**: React/Vite on Render (static site)
- **Database**: MongoDB Atlas

---

## Step 1: MongoDB Atlas Setup (5 min)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster (free tier)
4. Create a database user (save credentials)
5. Add your IP to whitelist
6. Copy connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/Students?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend to Render (10 min)

### Option A: Using GitHub (Recommended)

1. Push your repo to GitHub (should include `server/` folder)
2. Go to https://render.com and sign up
3. Click **"New +"** → **"Web Service"**
4. **Connect GitHub repository**
5. Configure:
   - **Name**: `feedback-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

6. Click **"Advanced"** and add Environment Variables:
   ```
   MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/Students
   NODE_ENV = production
   PORT = 3001
   ```

7. Click **"Create Web Service"**
8. Wait for deployment ✅
9. **Copy the backend URL** (e.g., `https://feedback-api.onrender.com`)

### Option B: Using render.yaml (One-Click)

1. Make sure `render.yaml` is in your root folder ✅
2. Go to https://render.com → **"New +"** → **"Blueprint"**
3. Connect your GitHub repo
4. It will auto-detect `render.yaml`
5. Fill in environment variables:
   - `MONGODB_URI`: Your connection string
6. Click **"Deploy"**

---

## Step 3: Deploy Frontend to Render (10 min)

1. Go to https://render.com
2. Click **"New +"** → **"Static Site"**
3. **Connect your GitHub repository**
4. Configure:
   - **Name**: `feedback-portal`
   - **Root Directory**: `feedback portal` (or leave empty)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

5. Click **"Advanced"** and add Environment Variables:
   ```
   VITE_API_URL = https://your-backend-url.onrender.com
   ```
   (Replace with your actual backend URL from Step 2)

6. Click **"Create Static Site"**
7. Wait for deployment ✅
8. Your app is now **LIVE**!

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on page refresh | Frontend already handles SPA routing ✅ |
| "Cannot POST /login" | Check `VITE_API_URL` matches backend URL exactly |
| MongoDB connection fails | Verify `MONGODB_URI` is correct; check IP whitelist |
| Backend shows 502 error | Check logs: Render dashboard → logs |
| Static site won't build | Verify build command: `npm install && npm run build` |

---

## Environment Variables Checklist

**Backend (Render Web Service)**
- [ ] `MONGODB_URI` = Your MongoDB connection string
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3001`

**Frontend (Render Static Site)**
- [ ] `VITE_API_URL` = Your backend URL (from Step 2)

---

## URLs After Deployment

- **Frontend**: `https://your-app.onrender.com`
- **Backend**: `https://your-api.onrender.com`
- **Both communicate** ✅

---

## Testing After Deployment

1. Visit your frontend URL
2. Test Sign Up
3. Test Login
4. Test Submit Feedback
5. Test View Feedbacks

If all work → **You're deployed!** 🎉

---

## Important Notes

- Free tier on Render: Services spin down after 15 min inactivity (cold starts)
- File uploads disabled (serverless environment)
- MongoDB Atlas free tier has 25GB storage limit
- Both frontend and backend on Render = simpler management ✅

---

## Quick Deploy Command (If using render.yaml)

Just push to GitHub:
```bash
git add .
git commit -m "Ready for Render"
git push
```

Then use one-click deploy on Render!
