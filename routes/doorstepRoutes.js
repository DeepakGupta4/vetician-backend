const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createBooking,
  getUserBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking
} = require('../controllers/doorstepController');

router.use(auth);

router.post('/bookings', createBooking);
router.get('/bookings', getUserBookings);
router.get('/bookings/:id', getBooking);
router.patch('/bookings/:id/status', updateBookingStatus);
router.patch('/bookings/:id/cancel', cancelBooking);

// Paravet routes
router.get('/paravet/bookings', async (req, res) => {
  try {
    const userId = req.user._id.toString();
    console.log('📝 Fetching paravet bookings for user:', userId);
    
    const DoorstepService = require('../models/DoorstepService');
    const bookings = await DoorstepService.find({ 
      servicePartnerId: userId,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    })
    .populate('petIds')
    .populate('userId', 'name email phone')
    .sort('-createdAt');
    
    console.log('✅ Found', bookings.length, 'bookings for paravet');
    if (bookings.length > 0) {
      console.log('📋 First booking:', {
        id: bookings[0]._id,
        serviceType: bookings[0].serviceType,
        status: bookings[0].status,
        userId: bookings[0].userId
      });
    }
    
    res.json({ success: true, data: bookings });
  } catch (error) {
    console.error('❌ Error fetching paravet bookings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
