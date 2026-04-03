const mongoose = require('mongoose');
const crypto   = require('crypto');

const CameraSchema = new mongoose.Schema({
  resortId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PetResort',
    required: true,
    index: true,
  },
  resortOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  name:       { type: String, required: true, trim: true },
  roomNumber: { type: String, trim: true, default: null },

  // ── Stream Type ───────────────────────────────────────────
  // 'rtsp'  → IP camera ka RTSP URL, media server pull karega
  // 'rtmp'  → Camera/OBS seedha RTMP push karega
  // 'hls'   → Already HLS URL hai (third party)
  // 'demo'  → Placeholder image (testing)
  streamType: {
    type: String,
    enum: ['rtsp', 'rtmp', 'hls', 'demo'],
    default: 'rtsp',
  },

  // ── RTSP URL (IP Camera ka) ───────────────────────────────
  // e.g. rtsp://admin:password@192.168.1.100:554/stream1
  // Ye private rehta hai - app ko nahi dikhta
  rtspUrl: {
    type: String,
    trim: true,
    default: null,
  },

  // ── Stream Key ────────────────────────────────────────────
  // Auto-generated unique key
  // RTMP push URL: rtmp://media.vetician.com/live/STREAM_KEY
  // HLS play URL:  https://media.vetician.com/live/STREAM_KEY/index.m3u8
  streamKey: {
    type: String,
    unique: true,
    default: () => crypto.randomBytes(12).toString('hex'), // e.g. "a3f9b2c1d4e5f6a7b8c9d0e1"
  },

  // ── HLS Play URL (app mein yahi use hoga) ─────────────────
  // Auto-set based on MEDIA_SERVER_URL env + streamKey
  // e.g. https://media.vetician.com/live/a3f9b2c1/index.m3u8
  hlsUrl: {
    type: String,
    default: null,
  },

  // ── Status ────────────────────────────────────────────────
  isActive:    { type: Boolean, default: true },
  isStreaming: { type: Boolean, default: false },  // Live hai ya nahi abhi
  lastStreamAt:{ type: Date,    default: null },

  thumbnailUrl:{ type: String,  default: null },

}, { timestamps: true });

CameraSchema.index({ resortId: 1, isActive: 1 });
CameraSchema.index({ streamKey: 1 }, { unique: true });

module.exports = mongoose.model('Camera', CameraSchema);
