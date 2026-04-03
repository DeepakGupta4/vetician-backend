const Camera        = require('../models/Camera');
const HostelBooking = require('../models/HostelBooking');
const PetResort     = require('../models/PetResort');
const { catchAsync } = require('../utils/catchAsync');
const { AppError }   = require('../utils/appError');

// Media server management API URL (same VPS pe chalega)
const MEDIA_MGMT_URL = process.env.MEDIA_MGMT_URL || 'http://localhost:8889';
const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL || 'http://localhost:8888';

// ── Helper: media server ko RTSP pull start karne bolo ────────
const triggerRtspStart = async (rtspUrl, streamKey) => {
  try {
    await fetch(`${MEDIA_MGMT_URL}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rtspUrl, streamKey }),
    });
  } catch (e) {
    console.error('Media server trigger failed:', e.message);
  }
};

const triggerRtspStop = async (streamKey) => {
  try {
    await fetch(`${MEDIA_MGMT_URL}/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ streamKey }),
    });
  } catch (e) {
    console.error('Media server stop failed:', e.message);
  }
};

// ═══════════════════════════════════════════════════
//  RESORT OWNER — Camera Management
// ═══════════════════════════════════════════════════

// POST /api/cameras
// Resort owner camera add kare
// Body: { resortId, name, roomNumber, streamType, rtspUrl OR hlsUrl }
const addCamera = catchAsync(async (req, res, next) => {
  const { resortId, name, roomNumber, streamType, rtspUrl, hlsUrl, thumbnailUrl } = req.body;
  const resortOwnerId = req.user._id;

  const resort = await PetResort.findOne({ _id: resortId, userId: resortOwnerId });
  if (!resort) return next(new AppError('Resort not found or unauthorized', 403));

  // Build camera object
  const cameraData = {
    resortId, resortOwnerId, name,
    roomNumber: roomNumber || null,
    streamType: streamType || 'rtsp',
    thumbnailUrl: thumbnailUrl || null,
  };

  // streamType ke hisaab se URL set karo
  if (streamType === 'rtsp') {
    if (!rtspUrl) return next(new AppError('RTSP URL required for rtsp type', 400));
    cameraData.rtspUrl = rtspUrl;
    // hlsUrl will be auto-set after save using streamKey
  } else if (streamType === 'hls') {
    if (!hlsUrl) return next(new AppError('HLS URL required for hls type', 400));
    cameraData.hlsUrl = hlsUrl;
  } else if (streamType === 'rtmp') {
    // streamKey auto-generated, hlsUrl will be set below
  }

  const camera = await Camera.create(cameraData);

  // Auto-set hlsUrl for rtsp/rtmp types using streamKey
  if (streamType === 'rtsp' || streamType === 'rtmp') {
    camera.hlsUrl = `${MEDIA_BASE_URL}/live/${camera.streamKey}/index.m3u8`;
    await camera.save();

    // Start RTSP pull immediately if rtsp type
    if (streamType === 'rtsp' && rtspUrl) {
      await triggerRtspStart(rtspUrl, camera.streamKey);
    }
  }

  // Return camera info (rtspUrl hidden from response for security)
  res.status(201).json({
    success: true,
    camera: {
      _id:         camera._id,
      name:        camera.name,
      roomNumber:  camera.roomNumber,
      streamType:  camera.streamType,
      streamKey:   camera.streamKey,
      hlsUrl:      camera.hlsUrl,
      isActive:    camera.isActive,
      isStreaming: camera.isStreaming,
      // RTMP push URL for resort owner reference
      rtmpPushUrl: streamType === 'rtmp'
        ? `rtmp://${process.env.MEDIA_SERVER_HOST || 'YOUR_VPS_IP'}/live/${camera.streamKey}`
        : null,
    },
  });
});

// GET /api/cameras/resort/:resortId
const getResortCameras = catchAsync(async (req, res, next) => {
  const { resortId } = req.params;
  const cameras = await Camera.find({ resortId, isActive: true })
    .select('-rtspUrl')  // RTSP URL hide karo (security)
    .sort({ createdAt: -1 });
  res.json({ success: true, cameras });
});

// PATCH /api/cameras/:cameraId
const updateCamera = catchAsync(async (req, res, next) => {
  const { rtspUrl, ...updateData } = req.body;

  const camera = await Camera.findOneAndUpdate(
    { _id: req.params.cameraId, resortOwnerId: req.user._id },
    updateData,
    { new: true }
  );
  if (!camera) return next(new AppError('Camera not found', 404));

  // If RTSP URL changed, restart pull
  if (rtspUrl && camera.streamType === 'rtsp') {
    await Camera.findByIdAndUpdate(camera._id, { rtspUrl });
    await triggerRtspStop(camera.streamKey);
    await triggerRtspStart(rtspUrl, camera.streamKey);
  }

  res.json({ success: true, camera });
});

// DELETE /api/cameras/:cameraId
const deleteCamera = catchAsync(async (req, res, next) => {
  const camera = await Camera.findOne({ _id: req.params.cameraId, resortOwnerId: req.user._id });
  if (!camera) return next(new AppError('Camera not found', 404));

  // Stop RTSP pull if running
  if (camera.streamType === 'rtsp') {
    await triggerRtspStop(camera.streamKey);
  }

  await Camera.findByIdAndUpdate(camera._id, { isActive: false });
  res.json({ success: true, message: 'Camera removed' });
});

// GET /api/cameras/:cameraId/status
// App poll kar sakti hai - camera live hai ya nahi
const getCameraStatus = catchAsync(async (req, res, next) => {
  const camera = await Camera.findById(req.params.cameraId).select('name isStreaming lastStreamAt hlsUrl');
  if (!camera) return next(new AppError('Camera not found', 404));
  res.json({ success: true, isStreaming: camera.isStreaming, hlsUrl: camera.hlsUrl });
});

// ═══════════════════════════════════════════════════
//  HOSTEL BOOKING
// ═══════════════════════════════════════════════════

// POST /api/cameras/bookings
const createBooking = catchAsync(async (req, res, next) => {
  const {
    petId, resortId, resortName, roomType,
    checkinDate, checkoutDate, checkinTime, checkoutTime, totalPrice,
  } = req.body;

  const booking = await HostelBooking.create({
    userId: req.user._id,
    petId, resortId, resortName, roomType,
    checkinDate, checkoutDate, checkinTime, checkoutTime,
    totalPrice: totalPrice || 0,
    status: 'confirmed',
  });

  res.status(201).json({ success: true, booking });
});

// GET /api/cameras/bookings/my
const getMyBookings = catchAsync(async (req, res, next) => {
  const bookings = await HostelBooking.find({ userId: req.user._id })
    .populate({ path: 'assignedCameraId', select: '-rtspUrl' })
    .populate('petId', 'name breed species petPhoto dob')
    .sort({ createdAt: -1 });
  res.json({ success: true, bookings });
});

// GET /api/cameras/bookings/active
// Consumer PetWatching page yahi call karta hai
const getActiveBooking = catchAsync(async (req, res, next) => {
  const booking = await HostelBooking.findOne({
    userId: req.user._id,
    status: 'checked_in',
  })
    .populate({ path: 'assignedCameraId', select: '-rtspUrl' })  // rtspUrl hide
    .populate('petId', 'name breed species petPhoto dob');

  res.json({ success: true, booking: booking || null });
});

// ═══════════════════════════════════════════════════
//  RESORT OWNER — Check-in & Camera Assignment
// ═══════════════════════════════════════════════════

// GET /api/cameras/bookings/resort/:resortId
const getResortBookings = catchAsync(async (req, res, next) => {
  const { resortId } = req.params;
  const resort = await PetResort.findOne({ _id: resortId, userId: req.user._id });
  if (!resort) return next(new AppError('Unauthorized', 403));

  const bookings = await HostelBooking.find({ resortId })
    .populate('petId', 'name breed species petPhoto')
    .populate('userId', 'name phone')
    .populate({ path: 'assignedCameraId', select: 'name roomNumber hlsUrl isStreaming' })
    .sort({ createdAt: -1 });

  res.json({ success: true, bookings });
});

// PATCH /api/cameras/bookings/:bookingId/checkin
// Resort owner pet check-in kare + camera assign kare
const checkInPet = catchAsync(async (req, res, next) => {
  const { bookingId } = req.params;
  const { cameraId, roomNumber } = req.body;

  const booking = await HostelBooking.findById(bookingId);
  if (!booking) return next(new AppError('Booking not found', 404));

  const resort = await PetResort.findOne({ _id: booking.resortId, userId: req.user._id });
  if (!resort) return next(new AppError('Unauthorized', 403));

  if (cameraId) {
    const camera = await Camera.findOne({ _id: cameraId, resortId: booking.resortId });
    if (!camera) return next(new AppError('Camera not found in this resort', 404));

    // Agar RTSP camera hai aur abhi stream nahi chal rahi to start karo
    if (camera.streamType === 'rtsp' && camera.rtspUrl && !camera.isStreaming) {
      await triggerRtspStart(camera.rtspUrl, camera.streamKey);
    }
  }

  booking.status              = 'checked_in';
  booking.assignedCameraId    = cameraId || null;
  booking.cameraAccessGranted = !!cameraId;
  if (roomNumber) booking.roomNumber = roomNumber;
  await booking.save();

  const updated = await HostelBooking.findById(bookingId)
    .populate({ path: 'assignedCameraId', select: '-rtspUrl' })
    .populate('petId', 'name breed species petPhoto');

  res.json({ success: true, booking: updated });
});

// PATCH /api/cameras/bookings/:bookingId/checkout
const checkOutPet = catchAsync(async (req, res, next) => {
  const booking = await HostelBooking.findById(req.params.bookingId);
  if (!booking) return next(new AppError('Booking not found', 404));

  booking.status              = 'checked_out';
  booking.cameraAccessGranted = false;
  booking.assignedCameraId    = null;
  await booking.save();

  res.json({ success: true, message: 'Pet checked out, camera access revoked' });
});

module.exports = {
  addCamera, getResortCameras, updateCamera, deleteCamera, getCameraStatus,
  createBooking, getMyBookings, getActiveBooking,
  getResortBookings, checkInPet, checkOutPet,
};
