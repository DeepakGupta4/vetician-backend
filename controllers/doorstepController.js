const DoorstepService = require('../models/DoorstepService');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create doorstep service booking
exports.createBooking = catchAsync(async (req, res, next) => {
  const {
    serviceType,
    petIds,
    servicePartnerId,
    servicePartnerName,
    appointmentDate,
    timeSlot,
    address,
    isEmergency,
    repeatBooking,
    specialInstructions,
    paymentMethod,
    couponCode,
    basePrice,
    emergencyCharge,
    discount,
    totalAmount
  } = req.body;

  if (!req.user || !req.user._id) {
    return next(new AppError('User not authenticated', 401));
  }

  console.log('📦 Creating booking for paravet:', servicePartnerId);
  console.log('👤 User ID from req.user:', req.user._id);
  console.log('📦 Booking data:', { serviceType, petIds, appointmentDate, timeSlot });

  const booking = await DoorstepService.create({
    userId: req.user._id,
    serviceType,
    petIds,
    servicePartnerId,
    servicePartnerName,
    appointmentDate,
    timeSlot,
    address,
    isEmergency,
    repeatBooking,
    specialInstructions,
    paymentMethod,
    couponCode,
    basePrice,
    emergencyCharge,
    discount,
    totalAmount,
    status: 'pending'
  });

  console.log('✅ Booking saved to DB:', booking._id);
  console.log('👤 Booking userId:', booking.userId);

  const populatedBooking = await DoorstepService.findById(booking._id)
    .populate('petIds')
    .populate('userId', 'name email phone');

  console.log('📡 Emitting to room: paravet-' + servicePartnerId);

  // Emit real-time notification to paravet
  const io = req.app.get('io');
  if (io) {
    io.to(`paravet-${servicePartnerId}`).emit('new-booking', populatedBooking);
    console.log('✅ Socket event emitted to paravet-' + servicePartnerId);
  } else {
    console.log('⚠️ Socket.io not available');
  }

  res.status(201).json({
    success: true,
    data: populatedBooking
  });
});

// Get all bookings for a user
exports.getUserBookings = catchAsync(async (req, res, next) => {
  console.log('📝 Fetching bookings for user:', req.user._id);
  
  const bookings = await DoorstepService.find({ userId: req.user._id })
    .populate('petIds')
    .sort('-createdAt');

  console.log('✅ Found', bookings.length, 'bookings');

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// Get single booking
exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await DoorstepService.findById(req.params.id)
    .populate('petIds')
    .populate('userId', 'name email phone');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

// Update booking status
exports.updateBookingStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  const booking = await DoorstepService.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  ).populate('petIds').populate('userId', 'name email phone');

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  // Emit real-time update to user
  const io = req.app.get('io');
  io.to(`user-${booking.userId._id}`).emit('booking-updated', booking);

  res.status(200).json({
    success: true,
    data: booking
  });
});

// Cancel booking
exports.cancelBooking = catchAsync(async (req, res, next) => {
  const booking = await DoorstepService.findById(req.params.id);

  if (!booking) {
    return next(new AppError('Booking not found', 404));
  }

  if (booking.userId.toString() !== req.user._id.toString()) {
    return next(new AppError('Not authorized to cancel this booking', 403));
  }

  booking.status = 'cancelled';
  await booking.save();

  res.status(200).json({
    success: true,
    data: booking
  });
});
