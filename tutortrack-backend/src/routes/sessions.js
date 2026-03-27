const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { getAll, getOne, getToday, getUpcoming, create, update, remove } = require('../controllers/sessionController');

router.use(authenticate);
router.get('/today',    getToday);
router.get('/upcoming', getUpcoming);
router.get('/',         getAll);
router.get('/:id',      getOne);
router.post('/',        create);
router.put('/:id',      update);
router.delete('/:id',   remove);

module.exports = router;
