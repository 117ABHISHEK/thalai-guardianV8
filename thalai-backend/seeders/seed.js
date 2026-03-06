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
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Iyer', 'Reddy', 'Nair', 'Joshi', 'Mehta', 'Desai', 'Khanna', 'Malhotra', 'Das', 'Roy', 'Chowdhury', 'Mukherjee', 'Khan-Abbas', 'Ahmed-Zai'];

const SPECIALIZATIONS = [
  'Hematology', 'Pediatric Hematology', 'Clinical Hematology', 
  'Transfusion Medicine', 'Internal Medicine', 'General Medicine'
];

const URGENCIES = ['low', 'medium', 'high', 'critical'];
const REQUEST_STATUSES = ['pending', 'searching', 'completed', 'cancelled'];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate structured phone avoiding collisions
const generateUniquePhone = (prefix, id) => `+91${prefix}${String(id).padStart(8, '0')}`;

// Blood group compatibility helper
const isBloodGroupCompatible = (donorGroup, patientGroup) => {
  const compatibility = {
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'O-': ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'],
    'A+': ['A+', 'AB+'],
    'A-': ['A+', 'A-', 'AB+', 'AB-'],
    'B+': ['B+', 'AB+'],
    'B-': ['B+', 'B-', 'AB+', 'AB-'],
    'AB+': ['AB+'],
    'AB-': ['AB+', 'AB-'],
  };
  return compatibility[donorGroup]?.includes(patientGroup) || false;
};

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
      bpSystolic: Math.floor(100 + Math.random() * 30),
      bpDiastolic: Math.floor(60 + Math.random() * 20),
      temperature: parseFloat((36.3 + Math.random() * 0.9).toFixed(1)),
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
      name: 'System Admin',
      email: 'admin@thalai.com',
      password: 'password123',
      role: 'admin',
      bloodGroup: 'O+',
      phone: generateUniquePhone('90', 0),
      address: { street: 'Command Center', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' },
      dateOfBirth: new Date('1985-01-01'),
      profilePicture: 'https://i.pravatar.cc/150?img=33',
      isActive: true
    });

    console.log('✅ Admin seeded.');

    // 2. Doctors (10)
    const doctorUsers = [];
    for (let i = 1; i <= 10; i++) {
      const u = await User.create({
        name: `Dr ${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`,
        email: `doctor${i}@thalai.com`,
        password: 'password123',
        role: 'doctor',
        bloodGroup: getRandom(BLOOD_GROUPS),
        phone: generateUniquePhone('91', i),
        address: { street: `Clinic ${i}`, city: getRandom(CITIES), state: 'Maharashtra', zipCode: `4000${getRandomInRange(10, 99)}` },
        dateOfBirth: new Date(1970 + getRandomInRange(0, 20), getRandomInRange(0, 11), getRandomInRange(1, 28)),
        profilePicture: `https://i.pravatar.cc/150?img=${20 + i}`,
        isActive: true
      });

      const d = await Doctor.create({
        user: u._id,
        specialization: getRandom(SPECIALIZATIONS),
        licenseNumber: `MCI-${10000 + i}`,
        qualification: 'MBBS, MD',
        experience: getRandomInRange(5, 25),
        hospital: { name: `${getRandom(CITIES)} Hospital`, address: u.address },
        isVerified: true,
        verifiedBy: admin._id,
        verificationDate: new Date()
      });
      doctorUsers.push(d);
    }
    console.log('✅ Doctors seeded.');

    // 3. Patients (45)
    const patientUsers = [];
    const patientComorbidities = [
      { condition: 'Iron Overload', treatment: 'Chelation therapy', notes: 'Monitor quarterly', severity: 'moderate' },
      { condition: 'Osteoporosis', treatment: 'Calcium supplements', notes: 'Bone scan annually', severity: 'mild' },
      { condition: 'Diabetes Type 2', treatment: 'Metformin', notes: 'Diet control', severity: 'moderate' }
    ];

    for (let i = 1; i <= 45; i++) {
      const age = i <= 5 ? getRandomInRange(5, 15) : getRandomInRange(16, 40);
      const dobYear = new Date().getFullYear() - age;
      const dob = new Date(dobYear, getRandomInRange(0, 11), getRandomInRange(1, 28));

      const u = await User.create({
        name: `${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`,
        email: `patient${i}@thalai.com`,
        password: 'password123',
        role: 'patient',
        bloodGroup: getRandom(BLOOD_GROUPS),
        phone: generateUniquePhone('92', i),
        address: { street: `Patient Street ${i}`, city: getRandom(CITIES), state: 'Maharashtra', zipCode: '400010' },
        dateOfBirth: dob,
        profilePicture: Math.random() > 0.3 ? `https://i.pravatar.cc/150?img=${i % 70}` : '',
        isActive: true
      });

      let parentDetails = null;
      if (age < 16) {
        parentDetails = {
          parentName: `${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`,
          parentPhone: generateUniquePhone('98', i),
          parentRelation: getRandom(['Father', 'Mother'])
        };
      }

      const p = await Patient.create({
        user: u._id,
        dob: u.dateOfBirth,
        heightCm: getRandomInRange(120, 180),
        weightKg: getRandomInRange(30, 70),
        thalassemiaType: getRandom(['Beta Thalassemia Major', 'Beta Thalassemia Intermedia', 'E-Beta Thalassemia', 'Alpha Thalassemia (HbH)']),
        splenectomy: Math.random() > 0.8,
        parentDetails,
        transfusionHistory: Array.from({ length: 3 }, (_, j) => ({
          date: new Date(Date.now() - j * 20 * 24 * 60 * 60 * 1000),
          units: getRandomInRange(1, 2),
          hb_value: parseFloat((7 + Math.random() * 3).toFixed(1)),
          location: 'City Hospital',
          bloodGroup: u.bloodGroup,
          hospital: 'City Hospital',
          doctor: `Dr. ${getRandom(LAST_NAMES)}`
        })),
        medicalReports: generatePatientReports(3),
        comorbidities: Math.random() > 0.5 ? [getRandom(patientComorbidities)] : [],
        currentHb: parseFloat((8 + Math.random() * 2).toFixed(1)),
        currentHbDate: new Date()
      });

      // Assign random doctor
      const d = getRandom(doctorUsers);
      await p.updateOne({ 'assignedDoctor': d.user });
      
      patientUsers.push(p); // saving Patient docs array to map easily to requests
    }
    console.log('✅ Patients seeded.');

    // 4. Donors (44)
    const donors = [];
    for (let i = 1; i <= 44; i++) {
        const age = i <= 5 ? getRandomInRange(14, 17) : getRandomInRange(18, 55);
        const dobYear = new Date().getFullYear() - age;
        const dob = new Date(dobYear, getRandomInRange(0, 11), getRandomInRange(1, 28));
        
        const u = await User.create({
          name: `${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`,
          email: `donor${i}@thalai.com`,
          password: 'password123',
          role: 'donor',
          bloodGroup: getRandom(BLOOD_GROUPS),
          phone: generateUniquePhone('93', i),
          address: { street: `Donor Zone ${i}`, city: getRandom(CITIES), state: 'Maharashtra', zipCode: '400021' },
          dateOfBirth: dob,
          profilePicture: Math.random() > 0.4 ? `https://i.pravatar.cc/150?img=${i % 70}` : '',
          isActive: true
        });

        // Enforce age logic explicitly
        let isVerified = false;
        let eligibilityStatus = 'deferred';
        let eligibilityReason = 'Pending verification';

        if (age >= 18) {
            isVerified = Math.random() > 0.2;
            eligibilityStatus = isVerified ? 'eligible' : 'deferred';
            eligibilityReason = isVerified ? 'Cleared for donation' : 'Awaiting clinical clearance';
        } else {
            eligibilityReason = 'Deferred: Under 18 years of age';
        }

        const donor = await Donor.create({
          user: u._id,
          dob: u.dateOfBirth,
          heightCm: getRandomInRange(150, 190),
          weightKg: getRandomInRange(50, 90),
          medicalHistory: [],
          medicalReports: generateDonorReports(2),
          lastDonationDate: isVerified ? new Date(Date.now() - getRandomInRange(90, 180) * 86400000) : null,
          totalDonations: isVerified ? getRandomInRange(1, 5) : 0,
          isVerified,
          verifiedBy: isVerified ? admin._id : null,
          verifiedAt: isVerified ? new Date() : null,
          availabilityStatus: isVerified,
          healthClearance: isVerified,
          eligibilityStatus,
          eligibilityReason
        });

        if (isVerified) {
          await DonorHistory.create({
            donorId: donor._id,
            donationDate: new Date(Date.now() - getRandomInRange(100, 200) * 86400000),
            bloodGroup: u.bloodGroup,
            unitsDonated: 1,
            location: { hospital: 'Main Blood Bank', city: u.address.city, state: 'Maharashtra' },
            healthStatus: 'excellent'
          });
        }
        donors.push(donor);
    }
    console.log('✅ Donors seeded.');

    // 5. Requests (30)
    const requests = [];
    for (let i = 0; i < 30; i++) {
      const p = getRandom(patientUsers);
      const u = await User.findById(p.user);
      const req = await Request.create({
        patientId: u._id, // References User model actually
        bloodGroup: u.bloodGroup,
        unitsRequired: getRandomInRange(1, 2),
        urgency: getRandom(URGENCIES),
        status: getRandom(REQUEST_STATUSES),
        location: { hospital: `${u.address.city} Care`, city: u.address.city, state: 'Maharashtra', address: u.address.street },
        contactPerson: { name: 'Support Contact', phone: u.phone, relationship: 'Guardian' }
      });
      requests.push(req);
    }
    console.log('✅ Requests seeded.');

    // 6. Appointments (40)
    for (let i = 0; i < 40; i++) {
        const p = getRandom(patientUsers);
        const d = getRandom(doctorUsers);
        const date = new Date(Date.now() + getRandomInRange(-30, 30) * 86400000);
        
        await Appointment.create({
            user: p.user,
            doctor: d.user,
            userRole: 'patient',
            date: date,
            time: getRandom(['10:00 AM', '11:30 AM', '02:00 PM', '04:15 PM', '05:00 PM']),
            status: getRandom(['scheduled', 'pending', 'completed']),
            reason: 'General Consultation',
            notes: 'System seeded appointment.'
        });
    }
    console.log('✅ Appointments seeded.');

    // 7. Connections (Circles)
    for (let i = 0; i < 30; i++) {
        const p = getRandom(patientUsers);
        const d = getRandom(donors);
        
        try {
            await Connection.create({
                patient: p.user,
                donor: d.user,
                requester: p.user,
                status: getRandom(['pending', 'active']),
                notes: 'Community connection'
            });
        } catch (e) {
            // ignore duplicate pairings
        }
    }
    console.log('✅ Connections seeded.');

    // 8. Match Logs
    for (let i = 0; i < 20; i++) {
        const r = getRandom(requests);
        const d = getRandom(donors);
        
        const donorUser = await User.findById(d.user);
        if (donorUser && isBloodGroupCompatible(donorUser.bloodGroup, r.bloodGroup) && d.eligibilityStatus === 'eligible') {
            await MatchLog.create({
                requestId: r._id,
                donorId: d._id,
                matchScore: getRandomInRange(70, 99),
                scoreBreakdown: { bloodGroupMatch: 40, locationScore: 20, availabilityScore: 20, donationFrequencyScore: 10, aiPredictionScore: 5 },
                status: getRandom(['pending', 'contacted', 'accepted'])
            });
        }
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
