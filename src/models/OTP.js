const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  expiresAt: {
    type: Date,
    required: true
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries and automatic cleanup
otpSchema.index({ email: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic cleanup

// Method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt.getTime();
};

// Method to increment attempts
otpSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

// Method to verify OTP
otpSchema.methods.verify = function(inputOTP) {
  if (this.isExpired()) {
    return { success: false, message: 'OTP expired' };
  }
  
  if (this.attempts >= 3) {
    return { success: false, message: 'Too many attempts' };
  }
  
  if (this.otp !== inputOTP) {
    this.incrementAttempts();
    return { success: false, message: 'Invalid OTP' };
  }
  
  return { success: true, message: 'OTP verified successfully' };
};

module.exports = mongoose.model('OTP', otpSchema);
