const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { subjectController: sc } = require('../controllers/otherControllers');

router.use(authenticate);
router.get('/',       sc.getAll);
router.post('/',      sc.create);
router.delete('/:id', sc.remove);

module.exports = router;
