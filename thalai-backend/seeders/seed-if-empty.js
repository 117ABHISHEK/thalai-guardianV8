const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const connectDB = require('../config/db');

// Load env vars
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const checkAndSeed = async () => {
  try {
    await connectDB();
    
    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      console.log(`✅ Database already has ${userCount} users. Skipping seed.`);
      process.exit(0);
    } else {
      console.log('⚠️ Database is empty. Running seeder...');
      // Import the main seed function
      // We need to require the file but suppressing its auto-execution if possible
      // Since seed.js auto-executes based on argv, we can just spawn it as a child process
      // or duplicate the logic. Spawning is safer to avoid code duplication issues if seed.js is not exported properly.
      
      const { execSync } = require('child_process');
      try {
        execSync('node seeders/seed.js', { stdio: 'inherit', cwd: require('path').resolve(__dirname, '..') });
        console.log('✅ Seed completed successfully via wrapper.');
        process.exit(0);
      } catch (e) {
        console.error('❌ Seed failed:', e);
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  }
};

checkAndSeed();
