const { body } = require('express-validator');

const validateSignup = [
  body('email').isEmail().normalizeEmail(),
  body('name').trim().isLength({ min: 2 }),
  body('dob').isISO8601().toDate()
];

const validateSignin = [
  body('email').isEmail().normalizeEmail()
];

const validateNote = [
  body('title').trim().isLength({ min: 1, max: 200 }),
  body('content').trim().isLength({ min: 1, max: 10000 })
];

module.exports = {
  validateSignup,
  validateSignin,
  validateNote
};
