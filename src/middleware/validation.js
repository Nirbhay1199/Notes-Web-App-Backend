const { body } = require('express-validator');

const validateSignup = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 })
];

const validateSignin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
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
