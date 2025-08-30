const { validationResult } = require('express-validator');
const { User } = require('../config/database');
const MockOTPService = require('../services/authSignalService');
const { generateToken } = require('../config/jwt');

class AuthController {
  static async signup(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, name, dob } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Create user
      const user = new User({
        email,
        name,
        dob
      });

      await user.save();

      // Send OTP for verification
      const otpResult = await MockOTPService.sendOTP(email);
      
      res.status(201).json({
        message: 'User registered successfully. Please verify your email with OTP.',
        userId: user._id,
        otpSent: otpResult.success,
        otp: otpResult.otp,           // Include OTP in response
        expiresAt: otpResult.expiresAt // Include expiration time
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async verifyOTP(req, res) {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const verificationResult = await MockOTPService.verifyOTP(email, otp);
      
      if (verificationResult.success) {
        // Mark user as verified
        user.verified = true;
        await user.save();
        
        res.json({ message: 'Email verified successfully' });
      } else {
        res.status(400).json({ error: verificationResult.message });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async signin(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'User not found. Please sign up first.' });
      }

      if (!user.verified) {
        return res.status(401).json({ error: 'Please verify your email first' });
      }

      // Send OTP for signin
      const otpResult = await MockOTPService.sendOTP(email);
      
      if (otpResult.success) {
        res.json({
          message: 'OTP sent successfully',
          email: user.email,
          userId: user._id,             // Include userId in response
          otp: otpResult.otp,          // Include OTP in response
          expiresAt: otpResult.expiresAt // Include expiration time
        });
      } else {
        res.status(500).json({ error: 'Failed to send OTP' });
      }
    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async verifySigninOTP(req, res) {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.verified) {
        return res.status(401).json({ error: 'Please verify your email first' });
      }

      const verificationResult = await MockOTPService.verifyOTP(email, otp);
      
      if (verificationResult.success) {
        // Generate JWT token
        const token = generateToken({
          userId: user._id,
          email: user.email
        });

        res.json({
          message: 'Sign in successful',
          user: user.toPublicJSON(),
          token: token
        });
      } else {
        res.status(400).json({ error: verificationResult.message });
      }
    } catch (error) {
      console.error('Signin OTP verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async logout(req, res) {
    // With JWT, logout is handled client-side by removing the token
    // Server-side, we could implement a blacklist if needed
    res.json({ message: 'Logged out successfully' });
  }

  static async getCurrentUser(req, res) {
    try {
      // User info is now available from JWT middleware
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        user: user.toPublicJSON()
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AuthController;
