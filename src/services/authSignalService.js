const { OTP } = require('../config/database');
const { Authsignal } = require('@authsignal/node');
require('dotenv').config();

class AuthSignalService {
  static async sendOTP(email) {
    try {
      // Check if we have AuthSignal credentials
      if (!process.env.AUTHSIGNAL_SECRET_KEY) {
        // Fallback to mock OTP for development
        return this.sendMockOTP(email);
      }

      // Use real AuthSignal SDK
      return await this.sendAuthSignalOTP(email);
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { success: false, message: 'Failed to send OTP' };
    }
  }

  static async sendAuthSignalOTP(email) {
    try {
      // Initialize AuthSignal with SDK
      const authsignal = new Authsignal({
        apiSecretKey: process.env.AUTHSIGNAL_SECRET_KEY,
      });

      console.log('🔍 AuthSignal Debug Info:');
      console.log('Secret Key (first 10 chars):', process.env.AUTHSIGNAL_SECRET_KEY?.substring(0, 10) + '...');
      console.log('Email:', email);

      // Track the sign-in action using official SDK
      const trackResponse = await authsignal.track({
        userId: email, // Using email as userId for simplicity
        action: 'signIn',
        attributes: { email }, // Required for email-based auth
      });

      console.log('✅ Track Response:', trackResponse);

      // Handle different action outcomes based on official documentation
      if (trackResponse.state === 'CHALLENGE_REQUIRED') {
        // User needs to complete email-based challenge
        // Store OTP in database for verification
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        // Remove any existing OTP for this email
        await OTP.deleteMany({ email });
        
        // Create new OTP record with AuthSignal challenge token
        const newOTP = new OTP({
          email,
          otp: 'AUTHSIGNAL_OTP', // Placeholder, actual OTP is managed by AuthSignal
          expiresAt,
          attempts: 0,
          authSignalToken: trackResponse.token // Store AuthSignal challenge token
        });
        
        await newOTP.save();
        
        return { 
          success: true, 
          message: 'OTP sent successfully via AuthSignal', 
          token: trackResponse.token 
        };
      } else if (trackResponse.state === 'ALLOW') {
        // Proceed with the action - no challenge needed
        return { success: true, message: 'Authentication successful without OTP' };
      } else if (trackResponse.state === 'BLOCK') {
        // Block the action for security reasons
        return { success: false, message: 'Action blocked for security reasons' };
      } else {
        throw new Error(`Unexpected AuthSignal response state: ${trackResponse.state}`);
      }
    } catch (error) {
      console.error('AuthSignal SDK error:', error);
      // Fallback to mock OTP if AuthSignal fails
      return this.sendMockOTP(email);
    }
  }

  static async sendMockOTP(email) {
    try {
      // Mock OTP for development/testing
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Remove any existing OTP for this email
      await OTP.deleteMany({ email });
      
      // Create new OTP
      const newOTP = new OTP({
        email,
        otp,
        expiresAt,
        attempts: 0
      });
      
      await newOTP.save();
      
      console.log(`[MOCK] OTP sent to ${email}: ${otp}`); // Remove in production
      return { success: true, message: 'OTP sent successfully (Mock Mode)' };
    } catch (error) {
      console.error('Error sending mock OTP:', error);
      return { success: false, message: 'Failed to send OTP' };
    }
  }
  
  static async verifyOTP(email, otp) {
    try {
      const storedOTP = await OTP.findOne({ email });
      
      if (!storedOTP) {
        return { success: false, message: 'OTP expired or not found' };
      }

      // Check if this is an AuthSignal OTP
      if (storedOTP.authSignalToken) {
        return await this.verifyAuthSignalOTP(email, otp, storedOTP.authSignalToken);
      } else {
        // Use local OTP verification
        return this.verifyLocalOTP(storedOTP, otp);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Failed to verify OTP' };
    }
  }

  static async verifyAuthSignalOTP(email, otp, authSignalToken) {
    try {
      // Initialize AuthSignal with SDK
      const authsignal = new Authsignal({
        apiSecretKey: process.env.AUTHSIGNAL_SECRET_KEY,
      });

      console.log('🔍 Verifying OTP with AuthSignal SDK:');
      console.log('Token:', authSignalToken);
      console.log('Email:', email);

      // Validate the verification token using official SDK
      const validationResult = await authsignal.validateChallenge({ token: authSignalToken });

      console.log('✅ Validation Result:', validationResult);

      if (validationResult.isValid) {
        // Authentication successful - proceed with user session creation
        // OTP verified successfully, remove it from database
        await OTP.deleteOne({ email });
        return { success: true, message: 'OTP verified successfully via AuthSignal' };
      } else {
        return { success: false, message: validationResult.message || 'Invalid OTP' };
      }
    } catch (error) {
      console.error('AuthSignal validation error:', error);
      return { success: false, message: 'Failed to verify OTP via AuthSignal' };
    }
  }

  static async verifyLocalOTP(storedOTP, inputOTP) {
    // Use the OTP model's verify method
    const result = storedOTP.verify(inputOTP);
    
    if (result.success) {
      // OTP verified successfully, remove it from database
      await OTP.deleteOne({ email: storedOTP.email });
    }
    
    return result;
  }
}

module.exports = AuthSignalService;
