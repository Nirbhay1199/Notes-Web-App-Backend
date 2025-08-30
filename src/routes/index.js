const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const notesRoutes = require('./notesRoutes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/notes', notesRoutes);

module.exports = router;
