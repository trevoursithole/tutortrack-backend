# TutorTrack — Deployment Guide

## Pre-Deployment Checklist

- [x] `/api/auth/register` is commented out in `src/routes/auth.js`
- [x] `start` script runs `prisma migrate deploy` before `node src/server.js`
- [x] `railway.json` config present in backend root
- [x] `vercel.json` config present in frontend root
- [x] All secrets in `.env` — never committed to GitHub

---

## Step 1 — Push to GitHub

Create two separate GitHub repositories:
- `tutortrack-backend`
- `tutortrack-frontend`

```bash
# Backend
cd tutortrack-backend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/tutortrack-backend.git
git push -u origin main

# Frontend
cd tutortrack-frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/tutortrack-frontend.git
git push -u origin main
```

Make sure you have a `.gitignore` — never push `.env` files.

---

## Step 2 — Deploy Backend on Railway

1. Go to [railway.app](https://railway.app) and sign up (free)
2. Click **New Project → Deploy from GitHub repo** → select `tutortrack-backend`
3. Click **Add Plugin → PostgreSQL** — Railway auto-creates the database
4. Go to your backend service → **Variables** tab → add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Click "Add Reference" → select the PostgreSQL plugin's `DATABASE_URL` |
| `JWT_SECRET` | Any long random string, e.g. `tutortrack_prod_secret_2025_xyz` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `FRONTEND_URL` | Leave blank for now — fill in after Vercel deploy |

5. Railway will auto-deploy. Watch the logs — you should see:
   ```
   ✅ TutorTrack API running on port 5000
   ```
6. Copy your Railway backend URL (looks like `https://tutortrack-backend-xxxx.railway.app`)

---

## Step 3 — Seed the Production Database

In Railway, go to your backend service → **Shell** tab and run:
```bash
node src/prisma/seed.js
```
This creates your admin account in the live database.

---

## Step 4 — Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up (free)
2. Click **New Project → Import Git Repository** → select `tutortrack-frontend`
3. Framework preset will auto-detect as **Vite** — leave all defaults
4. Go to **Environment Variables** and add:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | Your Railway backend URL e.g. `https://tutortrack-backend-xxxx.railway.app` |

5. Click **Deploy** — Vercel builds and deploys automatically
6. Copy your Vercel URL (looks like `https://tutortrack-frontend.vercel.app`)

---

## Step 5 — Connect Frontend URL to Backend CORS

1. Go back to Railway → your backend service → **Variables**
2. Set `FRONTEND_URL` to your Vercel URL: `https://tutortrack-frontend.vercel.app`
3. Railway will auto-redeploy the backend

---

## Step 6 — Go Live

Open your Vercel URL in the browser and log in:

| Field | Value |
|---|---|
| Email | trevourthetutor001@gmail.com |
| Password | admin123 |

**Change your password immediately in Settings.**

---

## Step 7 — Enable the Register Route (One-Time Only)

When you need to create additional user accounts:

1. In `src/routes/auth.js`, temporarily uncomment:
   ```js
   router.post('/register', register);
   ```
2. Push to GitHub → Railway auto-redeploys
3. Use Postman to POST to `/api/auth/register` with `{ name, email, password, role }`
4. Comment the route back out and push again

---

## Auto-Deploy (Already Configured)

Every time you push to `main` on either repo:
- Railway automatically rebuilds and redeploys the backend
- Vercel automatically rebuilds and redeploys the frontend

No manual steps needed after initial setup.

---

## Environment Variables Summary

### Backend (Railway)
```
DATABASE_URL=        ← from Railway PostgreSQL plugin
JWT_SECRET=          ← your strong secret key
NODE_ENV=production
PORT=5000
FRONTEND_URL=        ← your Vercel URL
```

### Frontend (Vercel)
```
VITE_API_BASE_URL=   ← your Railway backend URL
```

---

*TutorTrack · Trevour Sithole · trevourthetutor001@gmail.com*
