const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const helmet = require('helmet');
const hpp = require('hpp');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimiter');

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

// Initialize Express App
const app = express();

// 🚀 Global Process Error Handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n🛑 UNHANDLED REJECTION:');
  console.error(reason);
  logger.error('Unhandled Rejection', { reason: reason?.toString(), stack: reason?.stack });
  // In production, we might want to gracefully exit, but for dev we let nodemon handle it
});

process.on('uncaughtException', (error) => {
  console.error('\n🛑 UNCAUGHT EXCEPTION:');
  console.error(error);
  logger.error('Uncaught Exception', { error: error?.toString(), stack: error?.stack });
  process.exit(1);
});

/**
 * 🚀 Diagnostic Startup Sequence
 * Ensures all systems are ready before listening on port
 */
const startServer = async () => {
  try {
    console.log('------------------------------------------------');
    console.log('🏁 Starting ThalAI Guardian initialization...');
    console.log('------------------------------------------------');
    
    // 1. Connect to Database (Required)
    console.log('🗄️  Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Database connected successfully.');

    // 2. Configure CORS
    console.log('🛰️  Configuring CORS policies...');
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    const corsOptions = {
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const isAllowed = allowedOrigins.some(allowed => 
          origin === allowed || origin.startsWith(allowed)
        );
        const isRenderDomain = origin.includes('onrender.com');
        if (isAllowed || isRenderDomain) {
          callback(null, true);
        } else {
          if (process.env.NODE_ENV === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
            return callback(null, true);
          }
          callback(null, true); // Fallback to allow for production debugging
        }
      },
      credentials: true,
      optionsSuccessStatus: 200,
    };

    // 3. Middlewares
    console.log('📦  Setting up middleware...');
    app.use(helmet()); 
    app.use(hpp());
    app.use(cors(corsOptions));
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));

    if (process.env.NODE_ENV === 'development') {
      app.use(morgan('dev'));
    } else {
      app.use(morgan('combined', {
        stream: { write: (message) => logger.info(message.trim()) }
      }));
    }

    // 4. Routes
    console.log('🛣️  Initializing routes...');
    console.log('  - Attaching apiLimiter...');
    app.use('/api', apiLimiter);
    console.log('  - Attaching publicRoutes...');
    app.use('/api/public', publicRoutes);
    console.log('  - Attaching authRoutes...');
    app.use('/api/auth', authRoutes);
    console.log('  - Attaching adminRoutes...');
    app.use('/api/admin', adminRoutes);
    console.log('  - Attaching requestRoutes...');
    app.use('/api/requests', requestRoutes);
    console.log('  - Attaching donorRoutes...');
    app.use('/api/donors', donorRoutes);
    console.log('  - Attaching matchRoutes...');
    app.use('/api/match', matchRoutes);
    console.log('  - Attaching externalRoutes...');
    app.use('/api/external', externalRoutes);
    console.log('  - Attaching chatbotRoutes...');
    app.use('/api/chatbot', chatbotRoutes);
    console.log('  - Attaching notificationRoutes...');
    app.use('/api/notifications', notificationRoutes);
    console.log('  - Attaching doctorRoutes...');
    app.use('/api/doctor', doctorRoutes); 
    console.log('  - Attaching appointmentRoutes...');
    app.use('/api/appointments', appointmentRoutes);
    console.log('  - Attaching connectionRoutes...');
    app.use('/api/connections', connectionRoutes);
    console.log('✅ All routes initialized.');

    console.log('🩺 Attaching health check...');
    app.get('/api/health', (req, res) => {
      res.status(200).json({ status: 'healthy', timestamp: new Date() });
    });

    // 5. Serve Frontend
    console.log(`🌐 Checking frontend serving... (NODE_ENV: ${process.env.NODE_ENV}, SERVE_FRONTEND: ${process.env.SERVE_FRONTEND})`);
    if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === 'true') {
      const frontendPath = path.join(__dirname, '../thalai-frontend/dist');
      console.log(`📂 Attempting to serve frontend from: ${frontendPath}`);
      
      if (fs.existsSync(frontendPath)) {
        app.use(express.static(frontendPath));
        app.get('*', (req, res) => {
          if (req.url.startsWith('/api')) return res.status(404).json({ message: 'API route not found' });
          res.sendFile(path.join(frontendPath, 'index.html'));
        });
        console.log('✅ Frontend static routes configured.');
      } else {
        console.warn('⚠️  Frontend dist folder not found. API mode only.');
      }
    }

    // 6. Error Handlers
    console.log('🛡️  Setting up error handlers...');
    app.use((req, res) => {
      res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
    });
    app.use(errorHandler);
    console.log('✅ Error handlers ready.');

    // 7. Start Listening
    const PORT = process.env.PORT || 5000;
    console.log(`👂 Attempting to listen on port ${PORT}...`);
    
    const server = app.listen(PORT);

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    server.on('listening', () => {
      const addr = server.address();
      const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
      
      console.log('\n------------------------------------------------');
      console.log(`🚀 SERVER RUNNING ON ${bind}`);
      console.log(`🔌 Process ID: ${process.pid}`);
      console.log(`📡 Deployment Environment: ${process.env.NODE_ENV || 'production'}`);
      console.log('------------------------------------------------\n');
      
      logger.info(`Server started on ${bind}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'production'
      });
    });

    console.log('✅ Server instance created and listeners attached.');

  } catch (error) {
    console.error('\n------------------------------------------------');
    console.error('❌ CRITICAL STARTUP ERROR:');
    console.error(error.message);
    if (error.stack) console.error(error.stack);
    console.error('------------------------------------------------\n');
    process.exit(1);
  }
};

// Start the server
if (process.env.NODE_ENV !== 'test') {
    startServer();
}

module.exports = app;
