const cors = require('cors');

const corsConfig = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
};

module.exports = corsConfig;
