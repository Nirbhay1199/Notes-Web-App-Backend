const { OTP } = require('../config/database');

class AuthSignalService {
  static async sendOTP(email) {
    try {
      // In production, integrate with actual AuthSignal API
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
      
      console.log(`OTP sent to ${email}: ${otp}`); // Remove in production
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { success: false, message: 'Failed to send OTP' };
    }
  }
  
  static async verifyOTP(email, otp) {
    try {
      const storedOTP = await OTP.findOne({ email });
      
      if (!storedOTP) {
        return { success: false, message: 'OTP expired or not found' };
      }
      
      // Use the OTP model's verify method
      const result = storedOTP.verify(otp);
      
      if (result.success) {
        // OTP verified successfully, remove it from database
        await OTP.deleteOne({ email });
      }
      
      return result;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Failed to verify OTP' };
    }
  }
}

module.exports = AuthSignalService;
