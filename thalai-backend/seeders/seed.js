const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const Donor = require('../models/donorModel');
const Patient = require('../models/patientModel');
const Request = require('../models/requestModel');
const DonorHistory = require('../models/donorHistoryModel');
const Doctor = require('../models/doctorModel');
const Appointment = require('../models/appointmentModel');
const Connection = require('../models/connectionModel');
const Notification = require('../models/notificationModel');
const MatchLog = require('../models/matchLogModel');
const connectDB = require('../config/db');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow'];

const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Ishaan', 'Aaryan', 'Shaurya', 'Krishna', 'Diya', 'Ira', 'Ananya', 'Saanvi', 'Aditi', 'Myra', 'Avni', 'Aavya', 'Anika', 'Aadhya'];
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Iyer', 'Reddy', 'Nair', 'Joshi', 'Mehta', 'Desai', 'Khanna', 'Malhotra', 'Gupta', 'Iyer', 'Das', 'Roy', 'Chowdhury', 'Mukherjee'];

const SPECIALIZATIONS = [
  'Hematology', 'Pediatric Hematology', 'Clinical Hematology', 
  'Transfusion Medicine', 'Internal Medicine', 'General Medicine'
];

const URGENCIES = ['low', 'medium', 'high', 'critical'];
const REQUEST_STATUSES = ['pending', 'searching', 'completed', 'cancelled'];
const APPOINTMENT_STATUSES = ['scheduled', 'pending', 'completed', 'cancelled'];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper to generate donor medical reports
const generateDonorReports = (count) => {
  const reports = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000);
    reports.push({
      title: `Health Checkup - ${date.toLocaleDateString()}`,
      reportDate: date,
      hemoglobin: parseFloat((13 + Math.random() * 3).toFixed(1)),
      bpSystolic: Math.floor(110 + Math.random() * 30),
      bpDiastolic: Math.floor(70 + Math.random() * 20),
      pulseRate: Math.floor(60 + Math.random() * 30),
      temperature: parseFloat((36.5 + Math.random() * 0.7).toFixed(1)),
      heightCm: Math.floor(160 + Math.random() * 25),
      weightKg: Math.floor(55 + Math.random() * 30),
      notes: i === 0 ? 'All parameters within normal clinical range.' : `Periodic screening #${count - i}`
    });
  }
  return reports;
};

// Helper to generate patient medical reports
const generatePatientReports = (count) => {
  const reports = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000);
    reports.push({
      title: `Maintenance Profile - ${date.toLocaleDateString()}`,
      reportDate: date,
      hemoglobin: parseFloat((7 + Math.random() * 3).toFixed(1)),
      ferritin: Math.floor(500 + Math.random() * 2000),
      sgpt: Math.floor(15 + Math.random() * 60),
      sgot: Math.floor(15 + Math.random() * 60),
      creatinine: parseFloat((0.4 + Math.random() * 1).toFixed(1)),
      heightCm: Math.floor(130 + Math.random() * 40),
      weightKg: Math.floor(30 + Math.random() * 35),
      notes: i === 0 ? 'Regular transfusion cycle observation.' : `Clinical Log #${count - i}`
    });
  }
  return reports;
};

const seedData = async () => {
  try {
    console.log('🚀 INITIALIZING GLOBAL SYNC...');
    await connectDB();

    console.log('Purging database...');
    await User.deleteMany({});
    await Donor.deleteMany({});
    await Patient.deleteMany({});
    await Request.deleteMany({});
    await DonorHistory.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    await Connection.deleteMany({});
    await Notification.deleteMany({});
    await MatchLog.deleteMany({});

    // 1. Admin
    const admin = await User.create({
      name: 'Central Command Admin',
      email: 'admin@thalai.com',
      password: 'password123',
      role: 'admin',
      bloodGroup: 'O+',
      phone: '+91-9999999999',
      address: { street: 'Main Command Hub', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' },
      dateOfBirth: new Date('1985-01-01'),
      isActive: true
    });

    // 2. Doctors (10)
    const doctorUsers = [];
    for (let i = 1; i <= 10; i++) {
      const u = await User.create({
        name: `Dr. ${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`,
        email: `doctor${i}@thalai.com`,
        password: 'password123',
        role: 'doctor',
        bloodGroup: getRandom(BLOOD_GROUPS),
        phone: `+91-90000000${i.toString().padStart(2, '0')}`,
        address: { street: `${i} Medical Street`, city: getRandom(CITIES), state: 'Maharashtra', zipCode: '400001' },
        dateOfBirth: new Date('1975-01-01'),
        isActive: true
      });

      const d = await Doctor.create({
        user: u._id,
        specialization: getRandom(SPECIALIZATIONS),
        licenseNumber: `MCI-${10000 + i}`,
        qualification: 'MBBS, MD',
        experience: getRandomInRange(5, 25),
        hospital: {
          name: `${getRandom(CITIES)} Care Hospital`,
          address: { street: 'Medical Row', city: u.address.city, state: 'Maharashtra', zipCode: '400001' }
        },
        isVerified: true,
        verifiedBy: admin._id,
        verificationDate: new Date()
      });
      doctorUsers.push(d);
    }
    console.log('✅ Doctors seeded.');

    // 3. Patients (45)
    const patientUsers = [];
    for (let i = 1; i <= 45; i++) {
      const u = await User.create({
        name: `${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`,
        email: `patient${i}@thalai.com`,
        password: 'password123',
        role: 'patient',
        bloodGroup: getRandom(BLOOD_GROUPS),
        phone: `+91-91000000${i.toString().padStart(2, '0')}`,
        address: { street: `${i} Patient Colony`, city: getRandom(CITIES), state: 'Maharashtra', zipCode: '400001' },
        dateOfBirth: new Date('2010-01-01'),
        isActive: true
      });

      const transfusionHistory = [];
      for (let j = 0; j < 5; j++) {
        transfusionHistory.push({
          date: new Date(Date.now() - (j * 20 * 24 * 60 * 60 * 1000)),
          units: getRandomInRange(1, 2),
          hb_value: parseFloat((7 + Math.random() * 3).toFixed(1)),
          hospital: 'City Hospital',
          doctor: `Dr. ${getRandom(LAST_NAMES)}`
        });
      }

      const p = await Patient.create({
        user: u._id,
        heightCm: getRandomInRange(120, 180),
        weightKg: getRandomInRange(30, 70),
        thalassemiaType: getRandom([
          'Beta Thalassemia Major',
          'Beta Thalassemia Intermedia',
          'E-Beta Thalassemia',
          'Alpha Thalassemia (HbH)'
        ]),
        splenectomy: Math.random() > 0.8,
        transfusionHistory,
        medicalReports: generatePatientReports(5),
        currentHb: parseFloat((8 + Math.random() * 2).toFixed(1)),
        currentHbDate: new Date()
      });

      // Assign to random doctor
      const d = getRandom(doctorUsers);
      await d.assignPatient(p._id, admin._id, 'Seeded assignment');
      await d.save();

      patientUsers.push(u);
    }
    console.log('✅ Patients seeded.');

    // 4. Donors (44)
    const donorUsers = [];
    for (let i = 1; i <= 44; i++) {
      const u = await User.create({
        name: `${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`,
        email: `donor${i}@thalai.com`,
        password: 'password123',
        role: 'donor',
        bloodGroup: getRandom(BLOOD_GROUPS),
        phone: `+91-92000000${i.toString().padStart(2, '0')}`,
        address: { street: `${i} Donor Lane`, city: getRandom(CITIES), state: 'Maharashtra', zipCode: '400001' },
        dateOfBirth: new Date('1990-01-01'),
        isActive: true
      });

      const isVerified = Math.random() > 0.2;
      const donor = await Donor.create({
        user: u._id,
        dob: u.dateOfBirth,
        heightCm: getRandomInRange(150, 190),
        weightKg: getRandomInRange(50, 90),
        medicalReports: generateDonorReports(5),
        lastDonationDate: isVerified ? new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) : null,
        totalDonations: isVerified ? getRandomInRange(1, 10) : 0,
        isVerified,
        verifiedBy: isVerified ? admin._id : null,
        verifiedAt: isVerified ? new Date() : null,
        availabilityStatus: isVerified,
        healthClearance: isVerified,
        eligibilityStatus: isVerified ? 'eligible' : 'deferred'
      });

      if (isVerified) {
        await DonorHistory.create({
          donorId: donor._id,
          donationDate: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000),
          bloodGroup: u.bloodGroup,
          unitsDonated: 1,
          location: { hospital: 'Main Blood Bank', city: u.address.city, state: 'Maharashtra' },
          healthStatus: 'excellent'
        });
      }
      donorUsers.push(u);
    }
    console.log('✅ Donors seeded.');

    // 5. Requests (30)
    for (let i = 0; i < 30; i++) {
      const p = getRandom(patientUsers);
      await Request.create({
        patientId: p._id,
        bloodGroup: p.bloodGroup,
        unitsRequired: getRandomInRange(1, 2),
        urgency: getRandom(URGENCIES),
        status: getRandom(REQUEST_STATUSES),
        location: {
          hospital: `${p.address.city} Care`,
          city: p.address.city,
          state: 'Maharashtra',
          address: p.address.street
        },
        contactPerson: { name: 'Support', phone: p.phone, relationship: 'Guardian' }
      });
    }
    console.log('✅ Requests seeded.');
    
    const patients = await Patient.find();
    const doctors = await Doctor.find();
    const donors = await Donor.find();

    // 6. Appointments (40)
    for (let i = 0; i < 40; i++) {
        const p = getRandom(patients);
        const d = getRandom(doctors);
        const date = new Date(Date.now() + getRandomInRange(-30, 30) * 24 * 60 * 60 * 1000);
        
        await Appointment.create({
            user: p.user,
            doctor: d.user,
            userRole: 'patient',
            date: date,
            time: getRandom(['10:00 AM', '11:30 AM', '02:00 PM', '04:15 PM', '05:00 PM']),
            status: getRandom(['scheduled', 'pending', 'completed', 'cancelled']),
            reason: getRandom(['Regular Transfusion', 'Chronic Pain Checkup', 'Iron Overload Screening', 'Blood Compatibility Test', 'General Consultation']),
            notes: 'System generated clinical appointment during seeding.'
        });
    }
    console.log('✅ Appointments seeded.');

    // 7. Connections / Circles (50)
    for (let i = 0; i < 50; i++) {
        const p = getRandom(patients);
        const d = getRandom(donors);
        
        // Prevent duplicate connections if possible, but for seeding we just create
        try {
            await Connection.create({
                patient: p.user,
                donor: d.user,
                requester: p.user,
                status: getRandom(['pending', 'active']),
                notes: 'Community sync connection established.'
            });
        } catch (e) {
            // Skip duplicates
        }
    }
    console.log('✅ Connections (Circles) seeded.');

    // 8. Notifications / Neural Signals (60)
    const allUsers = await User.find();
    const notificationTypes = [
        'appointment_scheduled', 
        'donor_match', 
        'checkup_suggested', 
        'urgent_request', 
        'system',
        'connection_accepted'
    ];
    
    for (let i = 0; i < 60; i++) {
        const u = getRandom(allUsers);
        const type = getRandom(notificationTypes);
        
        await Notification.create({
            userId: u._id,
            title: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            message: `Neural Signal: Your clinical status for ${type.replace('_', ' ')} has been updated in the global registry.`,
            type: type,
            isRead: Math.random() > 0.5,
            channel: 'in_app'
        });
    }
    console.log('✅ Notifications seeded.');

    // 9. Match Logs (40)
    const requests = await Request.find();
    
    for (let i = 0; i < 40; i++) {
        const r = getRandom(requests);
        const d = getRandom(donors); // Donor model doc
        
        await MatchLog.create({
            requestId: r._id,
            donorId: d._id,
            matchScore: getRandomInRange(70, 99),
            scoreBreakdown: {
                bloodGroupMatch: 40,
                locationScore: getRandomInRange(15, 30),
                availabilityScore: 20,
                donationFrequencyScore: 10,
                aiPredictionScore: getRandomInRange(5, 10)
            },
            status: getRandom(['pending', 'contacted', 'accepted'])
        });
    }
    console.log('✅ Match Logs seeded.');

    console.log('\n🌟 SEEDING COMPLETE: 100 USERS CREATED');
    process.exit(0);
  } catch (err) {
    console.error('❌ SEED ERROR:', err);
    process.exit(1);
  }
};

const destroyData = async () => {
    try {
      await connectDB();
      await User.deleteMany({});
      await Donor.deleteMany({});
      await Patient.deleteMany({});
      await Request.deleteMany({});
      await DonorHistory.deleteMany({});
      await Doctor.deleteMany({});
      await Appointment.deleteMany({});
      await Connection.deleteMany({});
      await Notification.deleteMany({});
      await MatchLog.deleteMany({});
      console.log('✅ Data destroyed.');
      process.exit(0);
    } catch (error) {
      console.error('❌ Destroy failed:', error);
      process.exit(1);
    }
};

if (process.argv[2] === '-d' || process.argv[2] === '--destroy') {
    destroyData();
} else {
    seedData();
}
