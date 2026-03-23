const DoorstepService = require('../models/DoorstepService');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Create doorstep service booking
exports.createBooking = catchAsync(async (req, res, next) => {
  const {
    userId,
    serviceType,
    petIds,
    paravetId,
    paravetName,
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
    status
  } = req.body;

  if (!req.user || !req.user._id) {
    return next(new AppError('User not authenticated', 401));
  }

  console.log('📦 Creating booking for paravet:', paravetId);
  console.log('📊 Booking details:', {
    userId: req.user._id,
    paravetId,
    paravetName,
    serviceType
  });
  console.log('🔍 Full request body:', JSON.stringify(req.body, null, 2));

  const booking = await DoorstepService.create({
    userId: req.user._id,
    serviceType,
    petIds,
    servicePartnerId: paravetId,
    servicePartnerName: paravetName,
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
    status: status || 'pending'
  });

  console.log('✅ Booking created in DB:', booking._id);
  console.log('📋 Booking servicePartnerId:', booking.servicePartnerId);

  const populatedBooking = await DoorstepService.findById(booking._id)
    .populate('petIds')
    .populate('userId', 'name email phone');

  const io = req.app.get('io');
  if (io) {
    const roomName = `paravet-${paravetId}`;
    console.log('📡 Emitting to room:', roomName);
    console.log('📡 All socket rooms:', Array.from(io.sockets.adapter.rooms.keys()));
    
    io.to(roomName).emit('booking:new', {
      booking: populatedBooking,
      message: 'New booking request received'
    });
    console.log('✅ Notification sent to', roomName);
  } else {
    console.log('❌ Socket.io not available');
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

// Get all bookings for a paravet
exports.getParavetBookings = catchAsync(async (req, res, next) => {
  const { paravetId } = req.params;
  
  console.log('📥 Fetching bookings for paravet:', paravetId);
  
  const bookings = await DoorstepService.find({ servicePartnerId: paravetId })
    .populate('petIds')
    .populate('userId', 'name email phone')
    .sort('-createdAt');

  console.log('✅ Found', bookings.length, 'bookings for paravet', paravetId);
  if (bookings.length > 0) {
    console.log('📋 First booking servicePartnerId:', bookings[0].servicePartnerId);
  }

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

// Update booking status (accept/reject by paravet)
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

  const io = req.app.get('io');
  if (io) {
    // Notify user about status update
    io.to(`user-${booking.userId._id}`).emit('booking:statusUpdated', {
      bookingId: booking._id,
      status: booking.status,
      serviceType: booking.serviceType,
      paravetName: booking.servicePartnerName,
      message: status === 'confirmed' ? 'Booking confirmed' : status === 'cancelled' ? 'Booking cancelled' : 'Booking status updated'
    });
    console.log(`✅ Status update sent to user-${booking.userId._id}`);
    
    // Notify paravet to refresh earnings if status is confirmed
    if (status === 'confirmed') {
      io.to(`paravet-${booking.servicePartnerId}`).emit('booking-status-update', {
        bookingId: booking._id,
        status: booking.status,
        totalAmount: booking.totalAmount
      });
      console.log(`💰 Earnings update sent to paravet-${booking.servicePartnerId}`);
    }
  }

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
