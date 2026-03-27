// ── subjectController.js ─────────────────────────────────────
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAll = async (req, res, next) => {
  try {
    const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
    res.json(subjects);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required.' });
    const subject = await prisma.subject.create({ data: { name, description } });
    res.status(201).json(subject);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.json({ message: 'Subject deleted.' });
  } catch (err) { next(err); }
};

module.exports.subjectController = { getAll, create, remove };


// ── reminderController.js ─────────────────────────────────────
const getReminders = async (req, res, next) => {
  try {
    const reminders = await prisma.reminder.findMany({
      include: { student: true, session: { include: { subject: true } } },
      orderBy: { scheduled_for: 'asc' },
    });
    res.json(reminders);
  } catch (err) { next(err); }
};

const createReminder = async (req, res, next) => {
  try {
    const { session_id, student_id, message, scheduled_for } = req.body;
    if (!session_id || !student_id || !message || !scheduled_for)
      return res.status(400).json({ error: 'session_id, student_id, message and scheduled_for are required.' });

    const reminder = await prisma.reminder.create({
      data: { session_id, student_id, message, scheduled_for: new Date(scheduled_for) },
      include: { student: true, session: true },
    });
    res.status(201).json(reminder);
  } catch (err) { next(err); }
};

const markSent = async (req, res, next) => {
  try {
    const reminder = await prisma.reminder.update({
      where: { id: req.params.id },
      data: { sent: true, sent_at: new Date() },
    });
    res.json(reminder);
  } catch (err) { next(err); }
};

module.exports.reminderController = { getReminders, createReminder, markSent };


// ── dashboardController.js ────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      totalStudents,
      sessionsThisMonth,
      incomeThisMonth,
      outstandingPayments,
    ] = await Promise.all([
      prisma.student.count({ where: { is_active: true } }),
      prisma.session.count({ where: { session_date: { gte: monthStart, lte: monthEnd } } }),
      prisma.payment.aggregate({
        where: { status: 'paid', payment_date: { gte: monthStart, lte: monthEnd } },
        _sum: { amount: true },
      }),
      prisma.payment.count({ where: { status: { in: ['pending', 'overdue'] } } }),
    ]);

    res.json({
      totalStudents,
      sessionsThisMonth,
      incomeThisMonth: parseFloat(incomeThisMonth._sum.amount ?? 0),
      outstandingPayments,
    });
  } catch (err) { next(err); }
};

const getCalendar = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const y = parseInt(year  ?? new Date().getFullYear());
    const m = parseInt(month ?? new Date().getMonth() + 1) - 1;

    const start = new Date(y, m, 1);
    const end   = new Date(y, m + 1, 0, 23, 59, 59);

    const sessions = await prisma.session.findMany({
      where: { session_date: { gte: start, lte: end } },
      include: { student: true, subject: true },
      orderBy: { session_date: 'asc' },
    });
    res.json(sessions);
  } catch (err) { next(err); }
};

module.exports.dashboardController = { getStats, getCalendar };
