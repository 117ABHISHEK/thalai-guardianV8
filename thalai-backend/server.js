const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import Routes
const publicRoutes = require('./routes/publicRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const requestRoutes = require('./routes/requestRoutes');
const donorRoutes = require('./routes/donorRoutes');
const matchRoutes = require('./routes/matchRoutes');
const externalRoutes = require('./routes/externalRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Initialize Express App
const app = express();

// Connect to MongoDB
connectDB();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging with Morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', {
    stream: {
      write: (message) => logger.info(message.trim(), { type: 'http_request' })
    }
  }));
} else {
  // Production: log to file with more details
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim(), { type: 'http_request' })
    }
  }));
}

// Routes
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/notifications', notificationRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'ThalAI Guardian API is running' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  if (process.env.NODE_ENV !== 'test') {
    logger.info(`Server started on port ${PORT}`, {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  }
});

// Handle server errors gracefully
server.on('error', (error) => {
  logger.error('Server error', { error: error.message, code: error.code, stack: error.stack });
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error(`\n💡 Try one of these solutions:`);
    console.error(`   1. Kill the process using port ${PORT}:`);
    console.error(`      Windows: netstat -ano | findstr :${PORT}`);
    console.error(`      Then: taskkill /PID <PID> /F`);
    console.error(`   2. Or use a different port: PORT=5001 npm run dev`);
    console.error(`   3. Or run: npm run kill-port\n`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

module.exports = app;

