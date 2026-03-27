const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/payments
const getAll = async (req, res, next) => {
  try {
    const { status, student_id, from, to } = req.query;
    const where = {};
    if (status)     where.status = status;
    if (student_id) where.student_id = student_id;
    if (from || to) {
      where.created_at = {};
      if (from) where.created_at.gte = new Date(from);
      if (to)   where.created_at.lte = new Date(to);
    }

    const payments = await prisma.payment.findMany({
      where,
      include: { student: true, session: { include: { subject: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

// GET /api/payments/outstanding
const getOutstanding = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { status: { in: ['pending', 'overdue'] } },
      include: { student: true, session: { include: { subject: true } } },
      orderBy: { created_at: 'asc' },
    });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

// GET /api/payments/summary  — monthly income grouped by month
const getSummary = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { status: 'paid' },
      select: { amount: true, payment_date: true },
      orderBy: { payment_date: 'asc' },
    });

    const summary = {};
    for (const p of payments) {
      if (!p.payment_date) continue;
      const key = p.payment_date.toISOString().slice(0, 7); // "YYYY-MM"
      if (!summary[key]) summary[key] = 0;
      summary[key] += parseFloat(p.amount);
    }

    const result = Object.entries(summary).map(([month, total]) => ({ month, total }));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/payments/:id
const getOne = async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
      include: { student: true, session: { include: { subject: true } } },
    });
    if (!payment) return res.status(404).json({ error: 'Payment not found.' });
    res.json(payment);
  } catch (err) {
    next(err);
  }
};

// POST /api/payments
const create = async (req, res, next) => {
  try {
    const { session_id, student_id, amount, status, payment_date, method, notes } = req.body;
    if (!session_id || !student_id || !amount)
      return res.status(400).json({ error: 'session_id, student_id and amount are required.' });

    const payment = await prisma.payment.create({
      data: {
        session_id,
        student_id,
        amount: parseFloat(amount),
        status: status || 'pending',
        payment_date: payment_date ? new Date(payment_date) : null,
        method,
        notes,
      },
      include: { student: true, session: { include: { subject: true } } },
    });
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
};

// PUT /api/payments/:id
const update = async (req, res, next) => {
  try {
    const { status, amount, payment_date, method, notes } = req.body;
    const payment = await prisma.payment.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(amount       !== undefined && { amount: parseFloat(amount) }),
        ...(payment_date !== undefined && { payment_date: payment_date ? new Date(payment_date) : null }),
        method,
        notes,
      },
      include: { student: true, session: true },
    });
    res.json(payment);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, getOutstanding, getSummary, create, update };
