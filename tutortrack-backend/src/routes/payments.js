const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getAll, getOne, getOutstanding, getSummary, create, update } = require('../controllers/paymentController');

router.use(authenticate);
router.get('/outstanding', getOutstanding);
router.get('/summary',     getSummary);
router.get('/',            getAll);
router.get('/:id',         getOne);
router.post('/',           create);
router.put('/:id',         update);

module.exports = router;
