require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const sessionRoutes = require('./routes/sessions');
const paymentRoutes = require('./routes/payments');
const subjectRoutes = require('./routes/subjects');
const reminderRoutes = require('./routes/reminders');
const dashboardRoutes = require('./routes/dashboard');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/students',  studentRoutes);
app.use('/api/sessions',  sessionRoutes);
app.use('/api/payments',  paymentRoutes);
app.use('/api/subjects',  subjectRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'TutorTrack API' }));

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ──────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ TutorTrack API running on port ${PORT} [${process.env.NODE_ENV}]`);
});
