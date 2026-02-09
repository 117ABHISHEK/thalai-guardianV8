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
      name: 'Central Command Admin',
      email: 'admin@thalai.com',
      password: 'password123',
      role: 'admin',
      bloodGroup: 'O+',
      phone: '+91-9999999999',
      address: { 
        street: 'Main Command Hub, Administrative Block', 
        city: 'Mumbai', 
        state: 'Maharashtra', 
        zipCode: '400001' 
      },
      dateOfBirth: new Date('1985-01-01'),
      profilePicture: 'https://i.pravatar.cc/150?img=33',
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
        address: { 
          street: `${i} Medical Street, Healthcare Complex`, 
          city: getRandom(CITIES), 
          state: 'Maharashtra', 
          zipCode: `4000${getRandomInRange(10, 99)}` 
        },
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
        hospital: {
          name: `${getRandom(CITIES)} Care Hospital`,
          address: { street: 'Medical Row', city: u.address.city, state: 'Maharashtra', zipCode: u.address.zipCode }
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
    const patientComorbidities = [
      { condition: 'Iron Overload', treatment: 'Chelation therapy with Deferasirox', notes: 'Regular monitoring required', severity: 'moderate' },
      { condition: 'Osteoporosis', treatment: 'Calcium and Vitamin D supplementation', notes: 'Annual bone density scan', severity: 'mild' },
      { condition: 'Hypothyroidism', treatment: 'Levothyroxine 50mcg daily', notes: 'TSH levels monitored quarterly', severity: 'mild' },
      { condition: 'Diabetes Type 2', treatment: 'Metformin 500mg twice daily', notes: 'Diet controlled, HbA1c monitored', severity: 'moderate' },
      { condition: 'Cardiac Complications', treatment: 'Regular echocardiography', notes: 'Iron-induced cardiomyopathy monitoring', severity: 'severe' }
    ];

    // Profile picture URLs (using placeholder service)
    const profilePictures = [
      'https://i.pravatar.cc/150?img=1',
      'https://i.pravatar.cc/150?img=2',
      'https://i.pravatar.cc/150?img=3',
      'https://i.pravatar.cc/150?img=5',
      'https://i.pravatar.cc/150?img=8',
      'https://i.pravatar.cc/150?img=9',
      'https://i.pravatar.cc/150?img=12',
      'https://i.pravatar.cc/150?img=13',
      'https://i.pravatar.cc/150?img=14',
      'https://i.pravatar.cc/150?img=16'
    ];

    for (let i = 1; i <= 45; i++) {
      const u = await User.create({
        name: `${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`,
        email: `patient${i}@thalai.com`,
        password: 'password123',
        role: 'patient',
        bloodGroup: getRandom(BLOOD_GROUPS),
        phone: `+91-91000000${i.toString().padStart(2, '0')}`,
        address: { 
          street: `${i} Patient Colony, Ward ${getRandomInRange(1, 10)}`, 
          city: getRandom(CITIES), 
          state: 'Maharashtra', 
          zipCode: `4000${getRandomInRange(10, 99)}` 
        },
        dateOfBirth: new Date(2000 + getRandomInRange(0, 15), getRandomInRange(0, 11), getRandomInRange(1, 28)),
        profilePicture: Math.random() > 0.3 ? getRandom(profilePictures) : '', // 70% have profile pictures
        isActive: true
      });

      const transfusionHistory = [];
      const locations = ['City Hospital', 'Central Blood Bank', 'Regional Medical Center', 'District Hospital'];
      for (let j = 0; j < 5; j++) {
        transfusionHistory.push({
          date: new Date(Date.now() - (j * 20 * 24 * 60 * 60 * 1000)),
          units: getRandomInRange(1, 2),
          hb_value: parseFloat((7 + Math.random() * 3).toFixed(1)),
          location: getRandom(locations),
          bloodGroup: u.bloodGroup,
          hospital: getRandom(locations),
          doctor: `Dr. ${getRandom(LAST_NAMES)}`,
          notes: j === 0 ? 'Most recent transfusion, patient tolerated well' : `Routine transfusion cycle ${j + 1}`
        });
      }

      // Generate comorbidities for some patients
      const comorbidities = [];
      if (Math.random() > 0.5) { // 50% of patients have comorbidities
        const numConditions = getRandomInRange(1, 2);
        for (let j = 0; j < numConditions; j++) {
          const comorbidity = getRandom(patientComorbidities);
          comorbidities.push({
            condition: comorbidity.condition,
            severity: comorbidity.severity,
            diagnosisDate: new Date(Date.now() - getRandomInRange(365, 2190) * 24 * 60 * 60 * 1000), // 1-6 years ago
            treatment: comorbidity.treatment,
            notes: comorbidity.notes
          });
        }
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
        comorbidities: comorbidities,
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
    const donorConditions = [
      { condition: 'Seasonal Allergies', details: 'Mild pollen sensitivity, managed with antihistamines', contraindication: false },
      { condition: 'Hypertension (Controlled)', details: 'Blood pressure managed with lifestyle modifications', contraindication: false },
      { condition: 'Asthma (Mild)', details: 'Exercise-induced, well controlled with inhaler', contraindication: false },
      { condition: 'Previous Fracture', details: 'Healed wrist fracture from 2018, no complications', contraindication: false },
      { condition: 'Migraine', details: 'Occasional migraines, 2-3 times per year', contraindication: false },
      { condition: 'Vitamin D Deficiency', details: 'Supplementing with 2000 IU daily', contraindication: false }
    ];

    for (let i = 1; i <= 44; i++) {
      try {
        const age = getRandomInRange(18, 55); // Donors aged 18-55
        const dobYear = new Date().getFullYear() - age;
        
        const u = await User.create({
          name: `${getRandom(FIRST_NAMES)} ${getRandom(LAST_NAMES)}`,
          email: `donor${i}@thalai.com`,
          password: 'password123',
          role: 'donor',
          bloodGroup: getRandom(BLOOD_GROUPS),
          phone: `+91-92000000${i.toString().padStart(2, '0')}`,
          address: { 
            street: `${i} Donor Lane, Sector ${getRandomInRange(1, 20)}`, 
            city: getRandom(CITIES), 
            state: 'Maharashtra', 
            zipCode: `4000${getRandomInRange(10, 99)}` 
          },
          dateOfBirth: new Date(dobYear, getRandomInRange(0, 11), getRandomInRange(1, 28)),
          profilePicture: Math.random() > 0.4 ? getRandom(profilePictures) : '', // 60% have profile pictures
          isActive: true
        });

        const isVerified = Math.random() > 0.2;
        
        // Generate medical history (some donors have conditions, some don't)
        const medicalHistory = [];
        if (Math.random() > 0.4) { // 60% of donors have some medical history
          const numConditions = getRandomInRange(1, 3);
          for (let j = 0; j < numConditions; j++) {
            const condition = getRandom(donorConditions);
            medicalHistory.push({
              condition: condition.condition,
              details: condition.details,
              diagnosisDate: new Date(Date.now() - getRandomInRange(365, 1825) * 24 * 60 * 60 * 1000), // 1-5 years ago
              isContraindication: condition.contraindication
            });
          }
        }

        const donor = await Donor.create({
          user: u._id,
          dob: u.dateOfBirth,
          heightCm: getRandomInRange(150, 190),
          weightKg: getRandomInRange(50, 90),
          medicalHistory: medicalHistory,
          medicalReports: generateDonorReports(5),
          lastDonationDate: isVerified ? new Date(Date.now() - getRandomInRange(90, 180) * 24 * 60 * 60 * 1000) : null,
          totalDonations: isVerified ? getRandomInRange(1, 10) : 0,
          isVerified,
          verifiedBy: isVerified ? admin._id : null,
          verifiedAt: isVerified ? new Date() : null,
          availabilityStatus: isVerified,
          healthClearance: isVerified,
          eligibilityStatus: isVerified ? 'eligible' : 'deferred',
          eligibilityReason: isVerified ? 'All health parameters within acceptable range' : 'Pending admin review and health clearance'
        });

        if (isVerified) {
          await DonorHistory.create({
            donorId: donor._id,
            donationDate: new Date(Date.now() - getRandomInRange(100, 200) * 24 * 60 * 60 * 1000),
            bloodGroup: u.bloodGroup,
            unitsDonated: 1,
            location: { hospital: 'Main Blood Bank', city: u.address.city, state: 'Maharashtra' },
            healthStatus: 'excellent'
          });
        }
        donorUsers.push(u);
      } catch (err) {
        console.error(`Error creating donor ${i}:`, err);
      }
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
        
        // Find a compatible donor for this request
        const compatibleDonors = [];
        for (const donor of donors) {
            const donorUser = await User.findById(donor.user);
            if (donorUser && isBloodGroupCompatible(donorUser.bloodGroup, r.bloodGroup)) {
                compatibleDonors.push(donor);
            }
        }

        if (compatibleDonors.length > 0) {
            const d = getRandom(compatibleDonors);
            
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
