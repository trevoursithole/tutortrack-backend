const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/sessions
const getAll = async (req, res, next) => {
  try {
    const { student_id, subject_id, status, from, to } = req.query;
    const where = {};

    if (student_id) where.student_id = student_id;
    if (subject_id) where.subject_id = subject_id;
    if (status)     where.status = status;
    if (from || to) {
      where.session_date = {};
      if (from) where.session_date.gte = new Date(from);
      if (to)   where.session_date.lte = new Date(to);
    }

    const sessions = await prisma.session.findMany({
      where,
      include: { student: true, subject: true, payment: true },
      orderBy: { session_date: 'desc' },
    });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

// GET /api/sessions/today
const getToday = async (req, res, next) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);

    const sessions = await prisma.session.findMany({
      where: { session_date: { gte: start, lte: end } },
      include: { student: true, subject: true, payment: true },
      orderBy: { start_time: 'asc' },
    });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

// GET /api/sessions/upcoming
const getUpcoming = async (req, res, next) => {
  try {
    const now  = new Date();
    const week = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const sessions = await prisma.session.findMany({
      where: {
        session_date: { gte: now, lte: week },
        status: 'scheduled',
      },
      include: { student: true, subject: true },
      orderBy: { session_date: 'asc' },
    });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

// GET /api/sessions/:id
const getOne = async (req, res, next) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: { student: true, subject: true, payment: true, reminders: true },
    });
    if (!session) return res.status(404).json({ error: 'Session not found.' });
    res.json(session);
  } catch (err) {
    next(err);
  }
};

// POST /api/sessions
const create = async (req, res, next) => {
  try {
    const { student_id, subject_id, session_date, start_time, end_time, duration_min, hourly_rate, location, notes } = req.body;
    if (!student_id || !subject_id || !session_date || !start_time || !end_time)
      return res.status(400).json({ error: 'student_id, subject_id, session_date, start_time and end_time are required.' });

    const session = await prisma.session.create({
      data: {
        student_id,
        subject_id,
        session_date: new Date(session_date),
        start_time,
        end_time,
        duration_min: duration_min ? parseInt(duration_min) : null,
        hourly_rate:  hourly_rate  ? parseFloat(hourly_rate)  : null,
        location,
        notes,
      },
      include: { student: true, subject: true },
    });
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
};

// PUT /api/sessions/:id
const update = async (req, res, next) => {
  try {
    const { session_date, start_time, end_time, duration_min, hourly_rate, location, status, notes, subject_id } = req.body;
    const session = await prisma.session.update({
      where: { id: req.params.id },
      data: {
        ...(session_date && { session_date: new Date(session_date) }),
        start_time, end_time, duration_min, location, status, notes, subject_id,
        ...(hourly_rate !== undefined && { hourly_rate: parseFloat(hourly_rate) }),
      },
      include: { student: true, subject: true, payment: true },
    });
    res.json(session);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/sessions/:id
const remove = async (req, res, next) => {
  try {
    await prisma.session.delete({ where: { id: req.params.id } });
    res.json({ message: 'Session deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, getToday, getUpcoming, create, update, remove };
