const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const Doctor = require('../models/doctorModel');
const connectDB = require('../config/db');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const addDoctor = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if doctor already exists
    const existingUser = await User.findOne({ email: 'doctor1@thalai.com' });
    if (existingUser) {
      console.log('✅ Doctor already exists!');
      console.log('Email: doctor1@thalai.com');
      console.log('Password: password123');
      process.exit(0);
    }

    // Create doctor user
    const doctorUser = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'doctor1@thalai.com',
      password: 'password123',
      role: 'doctor',
      bloodGroup: 'A+',
      phone: '+91-9876543230',
      address: { 
        street: '300 Medical St', 
        city: 'Mumbai', 
        state: 'Maharashtra', 
        zipCode: '600001' 
      },
      dateOfBirth: new Date('1985-05-15'),
      isActive: true
    });

    console.log('✅ Doctor user created');

    // Get admin for verification
    const admin = await User.findOne({ role: 'admin' });

    // Create doctor profile
    await Doctor.create({
      user: doctorUser._id,
      licenseNumber: 'MH-MED-2015-12345',
      specialization: 'Hematology',
      qualification: 'MBBS, MD (Hematology)',
      experience: 8,
      hospital: {
        name: 'Mumbai Thalassemia Center',
        address: {
          street: '300 Medical Complex',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '600001'
        },
        phone: '+91-22-20000000'
      },
      isVerified: true,
      verifiedBy: admin ? admin._id : null,
      verificationDate: new Date(),
      verificationNotes: 'Credentials verified and approved',
      assignedPatients: [],
      totalPatientsAssigned: 0,
      activePatientsCount: 0
    });

    console.log('✅ Doctor profile created');
    console.log('\n📋 DOCTOR CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email: doctor1@thalai.com');
    console.log('Password: password123');
    console.log('Role: doctor');
    console.log('Status: Verified ✅');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Doctor account ready! You can now login at http://localhost:3000/login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addDoctor();
