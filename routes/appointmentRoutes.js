const express = require('express');
const { getVeterinarianAppointments } = require('../controllers/appointmentController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getVeterinarianAppointments);

module.exports = router;
