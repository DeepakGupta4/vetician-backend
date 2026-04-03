const mongoose = require('mongoose');

// ─── HostelBooking Schema ─────────────────────────────────────
// Jab user hostel book karta hai tab ye record banta hai
// assignedCamera = resort owner jab pet check-in kare tab camera assign karta hai
// Tab hi consumer app me live stream dikhti hai
// ─────────────────────────────────────────────────────────────

const HostelBookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true,
  },
  resortId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PetResort',
    required: true,
  },
  resortName: { type: String, required: true },
  roomType:   { type: String, required: true },   // "Standard Kennel", "Private Room", "Luxury Suite"
  roomNumber: { type: String, default: null },     // Assigned by resort owner at check-in

  checkinDate:  { type: String, required: true },  // "12 Jun 2025"
  checkoutDate: { type: String, required: true },
  checkinTime:  { type: String, default: null },
  checkoutTime: { type: String, default: null },

  totalPrice: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'],
    default: 'confirmed',
  },

  // ── Camera Access ──────────────────────────────────────────
  // Resort owner check-in ke waqt camera assign karta hai
  // Tab tak null rehta hai → consumer app "Waiting for check-in" dikhata hai
  assignedCameraId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camera',
    default: null,
  },
  cameraAccessGranted: {
    type: Boolean,
    default: false,
  },
  // ──────────────────────────────────────────────────────────

}, { timestamps: true });

HostelBookingSchema.index({ userId: 1, status: 1 });
HostelBookingSchema.index({ resortId: 1, status: 1 });

module.exports = mongoose.model('HostelBooking', HostelBookingSchema);
