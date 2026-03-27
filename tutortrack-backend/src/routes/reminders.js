const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { reminderController: rc } = require('../controllers/otherControllers');

router.use(authenticate);
router.get('/',         rc.getReminders);
router.post('/',        rc.createReminder);
router.put('/:id/send', rc.markSent);

module.exports = router;
