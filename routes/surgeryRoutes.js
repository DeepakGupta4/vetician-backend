const express = require('express');
const { getSurgeries, createSurgery, updateSurgery, deleteSurgery } = require('../controllers/surgeryController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getSurgeries);
router.post('/', auth, createSurgery);
router.put('/:id', auth, updateSurgery);
router.delete('/:id', auth, deleteSurgery);

module.exports = router;
