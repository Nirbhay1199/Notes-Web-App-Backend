const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validateSignup, validateSignin } = require('../middleware/validation');
const { requireAuth } = require('../middleware/auth');

// Authentication routes
router.post('/signup', validateSignup, AuthController.signup);
router.post('/verify-otp', AuthController.verifyOTP);
router.post('/signin', validateSignin, AuthController.signin);
router.post('/verify-signin-otp', AuthController.verifySigninOTP);
router.post('/google', AuthController.googleSignin);
router.post('/logout', requireAuth, AuthController.logout);
router.get('/me', requireAuth, AuthController.getCurrentUser);

module.exports = router;
