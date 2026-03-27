# TutorTrack — Full-Stack Tutoring Session Management System

Built by **Trevour Sithole** · trevourthetutor001@gmail.com · South Africa · 2025

---

## Stack

| Layer    | Technology                  |
|----------|-----------------------------|
| Frontend | React 18 + Vite + Tailwind  |
| Backend  | Node.js + Express.js        |
| Database | PostgreSQL + Prisma ORM     |
| Auth     | JWT (24hr expiry + bcrypt)  |
| Hosting  | Vercel (FE) + Railway (BE)  |

---

## Local Development (Your Own PC)

### Prerequisites
- Node.js 18+ → https://nodejs.org
- PostgreSQL → https://postgresql.org/download/windows (install with defaults, remember your password)

### 1. Backend Setup

```bash
cd tutortrack-backend
npm install
cp .env.example .env
```

Edit .env:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/tutortrack
JWT_SECRET=tutortrack_secret_key_trevour_2025_replace_this
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
npm run prisma:generate
npm run prisma:migrate     # type "init" when asked for migration name
npm run seed               # creates admin user + sample data
npm run dev                # starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd tutortrack-frontend
npm install
cp .env.example .env       # default value is already correct
npm run dev                # starts on http://localhost:3000
```

### 3. Login Credentials
- Email:    trevourthetutor001@gmail.com
- Password: admin123
- ⚠️  Change your password in Settings immediately after first login!

---

## Deploying Live (Production)

### Backend → Railway
1. Push tutortrack-backend to GitHub
2. railway.app → New Project → Deploy from GitHub
3. Add PostgreSQL plugin inside the project
4. Set environment variables:
   - DATABASE_URL  → auto-filled by Railway PostgreSQL plugin
   - JWT_SECRET    → any long random string
   - NODE_ENV      → production
   - FRONTEND_URL  → https://your-app.vercel.app
5. Railway auto-runs "npm start" which migrates then starts the server

### Frontend → Vercel
1. Push tutortrack-frontend to GitHub
2. vercel.com → New Project → Import from GitHub
3. Set environment variable:
   - VITE_API_BASE_URL → https://your-backend.railway.app
4. Deploy — Vercel auto-detects Vite

### Creating your admin account on the live server
In src/routes/auth.js, temporarily uncomment:
  router.post('/register', register);
Deploy, register your account at /api/auth/register, then comment it back out and redeploy.

---

## Security Checklist
- [x] Passwords hashed with bcrypt (12 salt rounds)
- [x] JWT tokens expire after 24 hours
- [x] All routes except login require valid JWT
- [x] Register endpoint disabled by default
- [x] CORS restricted to known frontend URL only
- [x] All secrets in environment variables — never in code
- [x] HTTPS enforced by Vercel + Railway by default
- [x] Soft-delete — student data never permanently lost
- [x] Global error handler — no stack traces leaked to client

---

TutorTrack · Trevour Sithole · trevourthetutor001@gmail.com
