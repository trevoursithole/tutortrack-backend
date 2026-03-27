// ── routes/auth.js ────────────────────────────────────────────
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { login, logout, me, register, changePassword } = require('../controllers/authController');

router.post('/login',    login);
// router.post('/register', register);     // ⚠️ UNCOMMENT ONCE to create admin, then comment back out
router.post('/logout',   authenticate, logout);
router.get('/me',        authenticate, me);
router.put('/password',  authenticate, changePassword);

module.exports = router;
