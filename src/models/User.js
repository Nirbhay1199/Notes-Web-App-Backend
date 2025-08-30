const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  dob: {
    type: Date,
    required: function() {
      // Only required if not a Google user
      return !this.googleId;
    }
  },
  verified: {
    type: Boolean,
    default: false
  },
  googleId: {
    type: String,
    sparse: true, // Allows multiple null values but unique non-null values
    index: true
  },
  profilePicture: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to get public user data
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  return user;
};

module.exports = mongoose.model('User', userSchema);
