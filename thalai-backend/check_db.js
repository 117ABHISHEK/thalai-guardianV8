const mongoose = require('mongoose');
const User = require('./models/userModel');
const Donor = require('./models/donorModel');
const connectDB = require('./config/db');
require('dotenv').config();

const check = async () => {
  try {
    await connectDB();
    const userCount = await User.countDocuments();
    const donorCount = await Donor.countDocuments();
    const userDonorCount = await User.countDocuments({ role: 'donor' });
    console.log(`Total Users: ${userCount}`);
    console.log(`Donors (User role): ${userDonorCount}`);
    console.log(`Donors (Donor model): ${donorCount}`);
    
    // Check if donor1 exists
    const donor1 = await User.findOne({ email: 'donor1@thalai.com' });
    console.log('donor1 exists:', !!donor1);
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
check();
