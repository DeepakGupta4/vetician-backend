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

// GET /api/doorstep/services - Get all available doorstep services
router.get('/services', (req, res) => {
  const services = [
    {
      _id: '1',
      title: 'Vet Home Visit',
      subtitle: 'General checkup, injections, first aid',
      price: 599,
      duration: '45-60 min',
      icon: 'stethoscope',
      iconSet: 'FontAwesome5',
      color: '#FF6B6B',
      active: true
    },
    {
      _id: '2',
      title: 'Vaccination at Home',
      subtitle: 'All vaccines administered safely',
      price: 499,
      duration: '30 min',
      icon: 'syringe',
      iconSet: 'FontAwesome5',
      color: '#4ECDC4',
      active: true
    },
    {
      _id: '3',
      title: 'Pet Grooming',
      subtitle: 'Bath, haircut, nail trim',
      price: 799,
      duration: '90-120 min',
      icon: 'cut',
      iconSet: 'FontAwesome5',
      color: '#95E1D3',
      active: true
    },
    {
      _id: '4',
      title: 'Pet Training Session',
      subtitle: 'Professional behavioral training',
      price: 899,
      duration: '60 min',
      icon: 'dog',
      iconSet: 'MaterialCommunityIcons',
      color: '#F38181',
      active: true
    },
    {
      _id: '5',
      title: 'Physiotherapy',
      subtitle: 'Post-surgery & recovery care',
      price: 1299,
      duration: '60 min',
      icon: 'medical-bag',
      iconSet: 'MaterialCommunityIcons',
      color: '#AA96DA',
      active: true
    },
    {
      _id: '6',
      title: 'Pet Walking',
      subtitle: 'Hourly or daily walks',
      price: 199,
      duration: '30 min',
      icon: 'walk',
      iconSet: 'MaterialCommunityIcons',
      color: '#FCBAD3',
      active: true
    }
  ];
  
  res.json({ success: true, data: services });
});

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
