const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { dashboardController: dc } = require('../controllers/otherControllers');

router.use(authenticate);
router.get('/stats',    dc.getStats);
router.get('/calendar', dc.getCalendar);

module.exports = router;
