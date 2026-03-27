const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/students
const getAll = async (req, res, next) => {
  try {
    const { active, search } = req.query;
    const where = {};

    if (active !== undefined) where.is_active = active === 'true';
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      orderBy: { full_name: 'asc' },
      include: {
        _count: { select: { sessions: true, payments: true } },
      },
    });
    res.json(students);
  } catch (err) {
    next(err);
  }
};

// GET /api/students/:id
const getOne = async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        sessions: {
          include: { subject: true, payment: true },
          orderBy: { session_date: 'desc' },
        },
        payments: { orderBy: { created_at: 'desc' } },
      },
    });
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json(student);
  } catch (err) {
    next(err);
  }
};

// POST /api/students
const create = async (req, res, next) => {
  try {
    const { full_name, email, phone, grade, guardian_name, guardian_phone, notes } = req.body;
    if (!full_name) return res.status(400).json({ error: 'full_name is required.' });

    const student = await prisma.student.create({
      data: { full_name, email, phone, grade, guardian_name, guardian_phone, notes },
    });
    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
};

// PUT /api/students/:id
const update = async (req, res, next) => {
  try {
    const { full_name, email, phone, grade, guardian_name, guardian_phone, notes, is_active } = req.body;
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: { full_name, email, phone, grade, guardian_name, guardian_phone, notes, is_active },
    });
    res.json(student);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/students/:id  — soft delete
const remove = async (req, res, next) => {
  try {
    await prisma.student.update({
      where: { id: req.params.id },
      data: { is_active: false },
    });
    res.json({ message: 'Student deactivated.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/students/:id/sessions
const getSessions = async (req, res, next) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { student_id: req.params.id },
      include: { subject: true, payment: true },
      orderBy: { session_date: 'desc' },
    });
    res.json(sessions);
  } catch (err) {
    next(err);
  }
};

// GET /api/students/:id/payments
const getPayments = async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { student_id: req.params.id },
      include: { session: { include: { subject: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.json(payments);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getOne, create, update, remove, getSessions, getPayments };
