const express = require('express');
const router = express.Router();
const { getPatients } = require('../controllers/patientController');
const { auth } = require('../middleware/auth');

router.get('/', auth, getPatients);

module.exports = router;
