const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createBooking,
  getUserBookings,
  getParavetBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking
} = require('../controllers/doorstepController');

router.use(auth);

router.post('/', createBooking);
router.get('/', getUserBookings);
router.get('/paravet/:paravetId', getParavetBookings);
router.get('/:id', getBooking);
router.put('/:id/status', updateBookingStatus);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
