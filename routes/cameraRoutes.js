const express = require('express');
const {
  addCamera, getResortCameras, updateCamera, deleteCamera, getCameraStatus,
  createBooking, getMyBookings, getActiveBooking,
  getResortBookings, checkInPet, checkOutPet,
} = require('../controllers/cameraController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// ── Camera routes (Resort Owner) ──────────────────────────────
router.post('/',                          auth, addCamera);
router.get('/resort/:resortId',           auth, getResortCameras);
router.get('/:cameraId/status',           auth, getCameraStatus);
router.patch('/:cameraId',                auth, updateCamera);
router.delete('/:cameraId',               auth, deleteCamera);

// ── Hostel Booking routes ─────────────────────────────────────
router.post('/bookings',                  auth, createBooking);
router.get('/bookings/my',                auth, getMyBookings);
router.get('/bookings/active',            auth, getActiveBooking);
router.get('/bookings/resort/:resortId',  auth, getResortBookings);
router.patch('/bookings/:bookingId/checkin',  auth, checkInPet);
router.patch('/bookings/:bookingId/checkout', auth, checkOutPet);

module.exports = router;
