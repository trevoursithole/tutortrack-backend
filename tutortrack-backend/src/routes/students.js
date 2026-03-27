const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getAll, getOne, create, update, remove, getSessions, getPayments } = require('../controllers/studentController');

router.use(authenticate);

router.get('/',               getAll);
router.get('/:id',            getOne);
router.post('/',              create);
router.put('/:id',            update);
router.delete('/:id',         remove);
router.get('/:id/sessions',   getSessions);
router.get('/:id/payments',   getPayments);

module.exports = router;
