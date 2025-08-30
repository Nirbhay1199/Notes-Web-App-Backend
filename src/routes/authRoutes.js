const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validateSignup, validateSignin } = require('../middleware/validation');

// Authentication routes
router.post('/signup', validateSignup, AuthController.signup);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/signin', validateSignin, AuthController.signin);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.getCurrentUser);

module.exports = router;
