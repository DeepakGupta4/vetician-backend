const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  verificationId: { type: String, required: true, unique: true },
  phoneNumber: String,
  email: String,
  otp: { type: String, required: true },
  userId: mongoose.Schema.Types.ObjectId,
  expiresAt: { type: Date, required: true },
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
