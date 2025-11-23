const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Donor = require('../models/donorModel');
const Request = require('../models/requestModel');
const DonorHistory = require('../models/donorHistoryModel');
const connectDB = require('../config/db');

// Load environment variables - use path relative to backend root
dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

// Seed data
const seedData = async () => {
  try {
    console.log('🔄 Starting seed process...');

    // Connect to database
    await connectDB();
    
    // Wait a bit to ensure connection is established
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Donor.deleteMany({});
    await Request.deleteMany({});
    await DonorHistory.deleteMany({});
    console.log('✅ Existing data cleared.');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create Admin User
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@thalai.com',
      password: 'password123',
      role: 'admin',
      bloodGroup: 'O+',
      phone: '+91-9876543210',
      address: {
        street: '123 Admin Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
      },
      dateOfBirth: new Date('1985-01-15'),
      isActive: true,
    });
    console.log('✅ Admin user created:', adminUser.email);

    // Create Patient Users
    const patientUsers = [
      {
        name: 'Rajesh Kumar',
        email: 'patient1@thalai.com',
        password: 'password123',
        role: 'patient',
        bloodGroup: 'A-',
        phone: '+91-9876543211',
        address: {
          street: '456 Patient Avenue',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
        },
        dateOfBirth: new Date('2010-05-20'),
        isActive: true,
      },
      {
        name: 'Priya Sharma',
        email: 'patient2@thalai.com',
        password: 'password123',
        role: 'patient',
        bloodGroup: 'B+',
        phone: '+91-9876543212',
        address: {
          street: '789 Health Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
        },
        dateOfBirth: new Date('2012-08-10'),
        isActive: true,
      },
      {
        name: 'Arjun Patel',
        email: 'patient3@thalai.com',
        password: 'password123',
        role: 'patient',
        bloodGroup: 'O-',
        phone: '+91-9876543213',
        address: {
          street: '321 Care Lane',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411001',
        },
        dateOfBirth: new Date('2015-03-15'),
        isActive: true,
      },
    ];

    // Create patients one by one to trigger password hashing
    const createdPatients = [];
    for (const patient of patientUsers) {
      const created = await User.create(patient);
      createdPatients.push(created);
    }
    console.log(`✅ ${createdPatients.length} patient users created`);

    // Create Donor Users
    const donorUsers = [
      {
        name: 'Vikram Singh',
        email: 'donor1@thalai.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        phone: '+91-9876543220',
        address: {
          street: '100 Donor Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400002',
        },
        dateOfBirth: new Date('1990-07-25'),
        isActive: true,
      },
      {
        name: 'Anita Reddy',
        email: 'donor2@thalai.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'A+',
        phone: '+91-9876543221',
        address: {
          street: '200 Blood Bank Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400003',
        },
        dateOfBirth: new Date('1988-11-12'),
        isActive: true,
      },
      {
        name: 'Ramesh Iyer',
        email: 'donor3@thalai.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'B+',
        phone: '+91-9876543222',
        address: {
          street: '300 Life Lane',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110002',
        },
        dateOfBirth: new Date('1992-04-18'),
        isActive: true,
      },
      {
        name: 'Sunita Mehta',
        email: 'donor4@thalai.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'AB+',
        phone: '+91-9876543223',
        address: {
          street: '400 Hope Avenue',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560002',
        },
        dateOfBirth: new Date('1987-09-30'),
        isActive: true,
      },
      {
        name: 'Mohammed Ali',
        email: 'donor5@thalai.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O-',
        phone: '+91-9876543224',
        address: {
          street: '500 Unity Street',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411002',
        },
        dateOfBirth: new Date('1995-02-14'),
        isActive: true,
      },
      {
        name: 'Kavita Desai',
        email: 'donor6@thalai.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'A-',
        phone: '+91-9876543225',
        address: {
          street: '600 Care Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400004',
        },
        dateOfBirth: new Date('1991-06-22'),
        isActive: true,
      },
      {
        name: 'Suresh Kumar',
        email: 'donor7@thalai.com',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'B-',
        phone: '+91-9876543226',
        address: {
          street: '700 Donation Lane',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110003',
        },
        dateOfBirth: new Date('1989-12-05'),
        isActive: true,
      },
    ];

    // Create donors one by one to trigger password hashing
    const createdDonors = [];
    for (const donor of donorUsers) {
      const created = await User.create(donor);
      createdDonors.push(created);
    }
    console.log(`✅ ${createdDonors.length} donor users created`);

    // Create Donor Profiles
    const donorProfiles = [];
    
    // Verified donors (first 4)
    donorProfiles.push(
      {
        user: createdDonors[0]._id, // Vikram Singh - O+
        availabilityStatus: true,
        lastDonationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        totalDonations: 5,
        isVerified: true,
        verifiedBy: adminUser._id,
        verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        notes: 'Regular donor, excellent health',
      },
      {
        user: createdDonors[1]._id, // Anita Reddy - A+
        availabilityStatus: true,
        lastDonationDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
        totalDonations: 8,
        isVerified: true,
        verifiedBy: adminUser._id,
        verifiedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        notes: 'Active donor, committed to regular donations',
      },
      {
        user: createdDonors[2]._id, // Ramesh Iyer - B+
        availabilityStatus: false,
        lastDonationDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        totalDonations: 3,
        isVerified: true,
        verifiedBy: adminUser._id,
        verifiedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        notes: 'Recently donated, needs rest period',
      },
      {
        user: createdDonors[3]._id, // Sunita Mehta - AB+
        availabilityStatus: true,
        lastDonationDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
        totalDonations: 12,
        isVerified: true,
        verifiedBy: adminUser._id,
        verifiedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        notes: 'Experienced donor, multiple donations',
      }
    );

    // Unverified donors (last 3)
    donorProfiles.push(
      {
        user: createdDonors[4]._id, // Mohammed Ali - O-
        availabilityStatus: true,
        lastDonationDate: null,
        totalDonations: 0,
        isVerified: false,
        notes: 'New donor, pending verification',
      },
      {
        user: createdDonors[5]._id, // Kavita Desai - A-
        availabilityStatus: false,
        lastDonationDate: null,
        totalDonations: 0,
        isVerified: false,
        notes: 'Registered but not verified yet',
      },
      {
        user: createdDonors[6]._id, // Suresh Kumar - B-
        availabilityStatus: true,
        lastDonationDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        totalDonations: 2,
        isVerified: false,
        notes: 'Has donation history, awaiting verification',
      }
    );

    const createdDonorProfiles = await Donor.insertMany(donorProfiles);
    console.log(`✅ ${createdDonorProfiles.length} donor profiles created`);

    // Create Donor History
    const donorHistoryRecords = [];
    
    // History for Vikram Singh (donor 0)
    for (let i = 0; i < 5; i++) {
      donorHistoryRecords.push({
        donorId: createdDonorProfiles[0]._id,
        donationDate: new Date(Date.now() - (90 + i * 90) * 24 * 60 * 60 * 1000),
        bloodGroup: 'O+',
        unitsDonated: 1,
        location: {
          hospital: 'Mumbai Blood Bank',
          city: 'Mumbai',
          state: 'Maharashtra',
        },
        healthStatus: 'excellent',
        notes: `Regular donation #${i + 1}`,
      });
    }

    // History for Anita Reddy (donor 1)
    for (let i = 0; i < 8; i++) {
      donorHistoryRecords.push({
        donorId: createdDonorProfiles[1]._id,
        donationDate: new Date(Date.now() - (120 + i * 90) * 24 * 60 * 60 * 1000),
        bloodGroup: 'A+',
        unitsDonated: 1,
        location: {
          hospital: 'City Hospital',
          city: 'Mumbai',
          state: 'Maharashtra',
        },
        healthStatus: i % 2 === 0 ? 'excellent' : 'good',
        notes: `Donation #${i + 1}`,
      });
    }

    // History for Ramesh Iyer (donor 2)
    for (let i = 0; i < 3; i++) {
      donorHistoryRecords.push({
        donorId: createdDonorProfiles[2]._id,
        donationDate: new Date(Date.now() - (45 + i * 120) * 24 * 60 * 60 * 1000),
        bloodGroup: 'B+',
        unitsDonated: 1,
        location: {
          hospital: 'Central Blood Bank',
          city: 'Delhi',
          state: 'Delhi',
        },
        healthStatus: 'good',
        notes: `Donation #${i + 1}`,
      });
    }

    // History for Sunita Mehta (donor 3)
    for (let i = 0; i < 12; i++) {
      donorHistoryRecords.push({
        donorId: createdDonorProfiles[3]._id,
        donationDate: new Date(Date.now() - (180 + i * 90) * 24 * 60 * 60 * 1000),
        bloodGroup: 'AB+',
        unitsDonated: 1,
        location: {
          hospital: 'Regional Medical Center',
          city: 'Bangalore',
          state: 'Karnataka',
        },
        healthStatus: i % 3 === 0 ? 'excellent' : 'good',
        notes: `Regular donation #${i + 1}`,
      });
    }

    // History for Suresh Kumar (donor 6)
    for (let i = 0; i < 2; i++) {
      donorHistoryRecords.push({
        donorId: createdDonorProfiles[6]._id,
        donationDate: new Date(Date.now() - (200 + i * 180) * 24 * 60 * 60 * 1000),
        bloodGroup: 'B-',
        unitsDonated: 1,
        location: {
          hospital: 'Community Hospital',
          city: 'Delhi',
          state: 'Delhi',
        },
        healthStatus: 'good',
        notes: `Donation #${i + 1}`,
      });
    }

    const createdHistory = await DonorHistory.insertMany(donorHistoryRecords);
    console.log(`✅ ${createdHistory.length} donor history records created`);

    // Create Blood Requests
    const bloodRequests = [
      {
        patientId: createdPatients[0]._id, // Rajesh Kumar - A-
        bloodGroup: 'A-',
        unitsRequired: 2,
        urgency: 'high',
        status: 'searching',
        location: {
          hospital: 'Apollo Hospital',
          address: '456 Patient Avenue',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
        },
        contactPerson: {
          name: 'Mrs. Kumar',
          phone: '+91-9876543299',
          relationship: 'Mother',
        },
        notes: 'Urgent requirement for scheduled transfusion',
      },
      {
        patientId: createdPatients[1]._id, // Priya Sharma - B+
        bloodGroup: 'B+',
        unitsRequired: 1,
        urgency: 'medium',
        status: 'pending',
        location: {
          hospital: 'Fortis Hospital',
          address: '789 Health Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
        },
        contactPerson: {
          name: 'Mr. Sharma',
          phone: '+91-9876543298',
          relationship: 'Father',
        },
        notes: 'Regular transfusion schedule',
      },
      {
        patientId: createdPatients[2]._id, // Arjun Patel - O-
        bloodGroup: 'O-',
        unitsRequired: 3,
        urgency: 'critical',
        status: 'searching',
        location: {
          hospital: 'Ruby Hall Clinic',
          address: '321 Care Lane',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411001',
        },
        contactPerson: {
          name: 'Ms. Patel',
          phone: '+91-9876543297',
          relationship: 'Guardian',
        },
        notes: 'Emergency situation, critical blood requirement',
      },
      {
        patientId: createdPatients[0]._id, // Rajesh Kumar - Another request (completed)
        bloodGroup: 'A-',
        unitsRequired: 2,
        urgency: 'medium',
        status: 'completed',
        location: {
          hospital: 'Apollo Hospital',
          address: '456 Patient Avenue',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
        },
        contactPerson: {
          name: 'Mrs. Kumar',
          phone: '+91-9876543299',
          relationship: 'Mother',
        },
        notes: 'Previous successful transfusion',
        completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    ];

    const createdRequests = await Request.insertMany(bloodRequests);
    console.log(`✅ ${createdRequests.length} blood requests created`);

    // Summary
    console.log('\n📊 SEED SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Total Users: ${1 + createdPatients.length + createdDonors.length}`);
    console.log(`   - Admin: 1`);
    console.log(`   - Patients: ${createdPatients.length}`);
    console.log(`   - Donors: ${createdDonors.length}`);
    console.log(`🩸 Donor Profiles: ${createdDonorProfiles.length}`);
    console.log(`   - Verified: ${createdDonorProfiles.filter(d => d.isVerified).length}`);
    console.log(`   - Available: ${createdDonorProfiles.filter(d => d.availabilityStatus).length}`);
    console.log(`📋 Blood Requests: ${createdRequests.length}`);
    console.log(`   - Pending: ${createdRequests.filter(r => r.status === 'pending').length}`);
    console.log(`   - Searching: ${createdRequests.filter(r => r.status === 'searching').length}`);
    console.log(`   - Completed: ${createdRequests.filter(r => r.status === 'completed').length}`);
    console.log(`📝 Donor History Records: ${createdHistory.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:');
    console.log('  Email: admin@thalai.com');
    console.log('  Password: password123');
    console.log('\nPatients:');
    createdPatients.forEach((p, i) => {
      console.log(`  Patient ${i + 1}: ${p.email} / password123`);
    });
    console.log('\nDonors:');
    createdDonors.forEach((d, i) => {
      console.log(`  Donor ${i + 1}: ${d.email} / password123`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('✅ Seed process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Destroy data
const destroyData = async () => {
  try {
    console.log('🔄 Starting data destruction...');
    await connectDB();
    await new Promise(resolve => setTimeout(resolve, 2000));

    await User.deleteMany({});
    await Donor.deleteMany({});
    await Request.deleteMany({});
    await DonorHistory.deleteMany({});

    console.log('✅ All data destroyed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error destroying data:', error);
    process.exit(1);
  }
};

// Check command line arguments
if (process.argv[2] === '-d' || process.argv[2] === '--destroy') {
  destroyData();
} else {
  seedData();
}
