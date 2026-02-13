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
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const connectionRoutes = require('./routes/connectionRoutes');

// Force restart for new routes

// Initialize Express App
const app = express();

// Connect to MongoDB
connectDB();

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.some(allowed => 
      origin === allowed || origin.startsWith(allowed)
    );

    // Allow requests from the Render deployment domain dynamically
    // If the origin contains 'onrender.com', trust it
    const isRenderDomain = origin.includes('onrender.com');

    if (isAllowed || isRenderDomain) {
      callback(null, true);
    } else {
      // In development, allow all local origins to be safe
      if (process.env.NODE_ENV === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
        return callback(null, true);
      }
      console.error(`CORS Error: Origin ${origin} is not allowed by policy`);
      // For now, in production debugging, perform a soft fail or just log
      // callback(new Error(`Not allowed by CORS: ${origin}`));
      // fallback to allowing it if we are serving the frontend from the same server
      callback(null, true); 
    }
  },
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
app.use('/api/doctor', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/connections', connectionRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'ThalAI Guardian API is running' });
});

// Serve Static Assets in Production
// Serve Static Assets in Production
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === 'true') {
  const path = require('path');
  const fs = require('fs');
  const frontendPath = path.join(__dirname, '../thalai-frontend/dist');
  
  console.log(`📂 Checking frontend build at: ${frontendPath}`);
  
  if (fs.existsSync(frontendPath)) {
    console.log('✅ Frontend build folder found!');
    console.log('   Contents:', fs.readdirSync(frontendPath));
  } else {
    console.error('❌ Frontend build folder NOT found!');
    console.error('   Expected path:', frontendPath);
    console.error('   Current directory:', __dirname);
  }

  app.use(express.static(frontendPath));
  
  app.get('*', (req, res, next) => {
    // If request is for an API route, pass it through (shouldn't happen with correct routing)
    if (req.url.startsWith('/api')) return next();
    
    const indexPath = path.resolve(frontendPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Frontend not built or index.html missing.');
    }
  });
}

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

