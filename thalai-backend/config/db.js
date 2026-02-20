const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/thalai-guardian';
    
    // Use a separate database for testing
    if (process.env.NODE_ENV === 'test' && !mongoURI.includes('-test')) {
      mongoURI = mongoURI.includes('?') 
        ? mongoURI.replace('?', '-test?') 
        : `${mongoURI}-test`;
    }

    const conn = await mongoose.connect(mongoURI);

    if (process.env.NODE_ENV !== 'test') {
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

