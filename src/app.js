require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const session = require('express-session');

// Import configurations
const sessionConfig = require('./config/session');
const corsConfig = require('./config/cors');
const rateLimitConfig = require('./config/rateLimit');
const { connectDB } = require('./config/database');

// Import routes
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(corsConfig));

// Rate limiting
app.use('/api/', rateLimit(rateLimitConfig));

// Session configuration
app.use(session(sessionConfig));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = { app, PORT };
