const mongoose = require('mongoose');

const passwordResetOtpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true }, // hashed OTP
    expiresAt: { type: Date, required: true },
    isUsed: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

passwordResetOtpSchema.index({ userId: 1, isUsed: 1, expiresAt: 1 });

module.exports = mongoose.model('PasswordResetOtp', passwordResetOtpSchema);

