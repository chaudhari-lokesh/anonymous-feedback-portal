# Render Deployment Guide for Anonymous Feedback Portal

## 🎯 Overview
- **Backend API**: Node.js + Express on Render
- **Frontend**: React + Vite static site on Render
- **Database**: MongoDB Atlas

## Step 1: MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a cluster (free tier is fine)
3. Create a database user and save credentials
4. Add an IP access entry for Render or `0.0.0.0/0` for testing
5. Copy the connection string and use a database name, for example:

```bash
mongodb+srv://username:password@cluster0.mongodb.net/StudentsPortal?retryWrites=true&w=majority
```

## Step 2: Deploy Backend to Render

### Option A: Use `render.yaml` Blueprint (recommended)

1. Push the repository to GitHub.
2. Open Render and choose **New + → Blueprint**.
3. Connect your GitHub repository.
4. Render will detect `render.yaml` automatically.
5. Provide environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV` = `production`
6. Deploy the service.

### Option B: Manual Web Service

1. Create a new Render **Web Service**.
2. Set:
   - **Name**: `feedback-api`
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV` = `production`
4. Deploy.

When the backend is live, copy its public URL, for example:

```text
https://feedback-api.onrender.com
```

## Step 3: Deploy Frontend to Render

1. Create a new Render **Static Site**.
2. Set:
   - **Name**: `feedback-portal`
   - **Root Directory**: `feedback portal`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
3. Set environment variable:
   - `VITE_API_URL` = backend public URL
4. Deploy.

## Environment Variables

### Backend
- `MONGODB_URI` (Atlas connection string)
- `JWT_SECRET` (strong random secret)
- `NODE_ENV=production`

### Frontend
- `VITE_API_URL` = backend service URL (no trailing slash)

## Admin User Setup

Create the staff account after backend deploys.

From `server/` run:

```bash
cd server
npm run seed:teacher
```

To customize credentials:

```bash
TEACHER_EMAIL=admin@school.edu TEACHER_PASSWORD=Admin123 TEACHER_ROLE=teacher npm run seed:teacher
```

Valid staff roles are `teacher`, `hod`, and `principal`.

## Troubleshooting

- `Cannot POST /login`: `VITE_API_URL` is wrong or backend is not reachable.
- MongoDB connection fails: wrong `MONGODB_URI` or Atlas IP access blocked.
- Backend logs show errors: check Render logs for stack traces.
- Frontend build fails: verify `npm install && npm run build` works locally.

## Quick deploy flow

1. Deploy backend service first.
2. Copy backend URL.
3. Set `VITE_API_URL` for frontend service.
4. Deploy frontend.

## Notes

- Render static site is only for the frontend.
- Backend must remain hosted separately as a Node service.
- `render.yaml` is the best setup for this repo.
