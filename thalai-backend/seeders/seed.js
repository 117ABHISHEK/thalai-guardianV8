const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/userModel');
const Donor = require('../models/donorModel');
const Patient = require('../models/patientModel');
const Request = require('../models/requestModel');
const DonorHistory = require('../models/donorHistoryModel');
const Doctor = require('../models/doctorModel');
const Appointment = require('../models/appointmentModel');
const connectDB = require('../config/db');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

// Helper to generate donor medical reports
const generateDonorReports = (count) => {
  const reports = [];
  for (let i = 0; i < count; i++) {
    const date = new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000);
    reports.push({
      title: `Health Checkup - ${date.toLocaleDateString()}`,
      reportDate: date,
      hemoglobin: (13 + Math.random() * 3).toFixed(1),
      bpSystolic: Math.floor(110 + Math.random() * 30),
      bpDiastolic: Math.floor(70 + Math.random() * 20),
      pulseRate: Math.floor(60 + Math.random() * 30),
      temperature: (36.5 + Math.random() * 0.7).toFixed(1),
      heightCm: Math.floor(160 + Math.random() * 25),
      weightKg: Math.floor(55 + Math.random() * 30),
      notes: i === 0 ? 'Latest checkup - all normal' : `Checkup #${count - i}`
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
      title: `Thalassemia Profile - ${date.toLocaleDateString()}`,
      reportDate: date,
      hemoglobin: (7 + Math.random() * 3).toFixed(1),
      ferritin: Math.floor(800 + Math.random() * 1200),
      sgpt: Math.floor(20 + Math.random() * 40),
      sgot: Math.floor(20 + Math.random() * 40),
      creatinine: (0.6 + Math.random() * 0.6).toFixed(1),
      heightCm: Math.floor(140 + Math.random() * 30),
      weightKg: Math.floor(35 + Math.random() * 25),
      notes: i === 0 ? 'Recent screening' : `Report #${count - i}`
    });
  }
  return reports;
};

const seedData = async () => {
  try {
    console.log('🔄 Starting seed...');
    await connectDB();
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('🧹 Clearing data...');
    await User.deleteMany({});
    await Donor.deleteMany({});
    await Patient.deleteMany({});
    await Request.deleteMany({});
    await DonorHistory.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});
    console.log('✅ Data cleared');

    // Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@thalai.com',
      password: 'password123',
      role: 'admin',
      bloodGroup: 'O+',
      phone: '+91-9876543210',
      address: { street: '123 Admin St', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' },
      dateOfBirth: new Date('1985-01-15'),
      isActive: true
    });
    console.log('✅ Admin created');

    // 3 Doctors
    const doctorData = [
      { name: 'Dr. Sameer Joshi', email: 'doctor1@thalai.com', specialization: 'Pediatric Hematology', license: 'MCI-12345', exp: 12 },
      { name: 'Dr. Aditi Verma', email: 'doctor2@thalai.com', specialization: 'Clinical Hematology', license: 'MCI-67890', exp: 8 },
      { name: 'Dr. Rajesh Khanna', email: 'doctor3@thalai.com', specialization: 'Transfusion Medicine', license: 'MCI-99887', exp: 15 }
    ];

    const doctors = [];
    for (let i = 0; i < doctorData.length; i++) {
        const d = doctorData[i];
        const user = await User.create({
            name: d.name,
            email: d.email,
            password: 'password123',
            role: 'doctor',
            bloodGroup: 'B+',
            phone: `+91-900000000${i+1}`,
            address: { street: `Clinic ${i+1}`, city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' },
            dateOfBirth: new Date('1975-05-10'),
            isActive: true
        });

        const doctor = await Doctor.create({
            user: user._id,
            specialization: d.specialization,
            licenseNumber: d.license,
            qualification: 'MBBS, MD (Hematology)',
            experience: d.exp,
            hospital: {
                name: 'Thalassemia Care Center',
                address: { street: 'Main Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400001' }
            },
            isVerified: true,
            verifiedBy: admin._id,
            verificationDate: new Date()
        });
        doctors.push(user);
    }
    console.log(`✅ ${doctors.length} doctors created`);

    // 10 Patients
    const patientData = [
      { name: 'Rajesh Kumar', email: 'patient1@thalai.com', bloodGroup: 'A-', city: 'Delhi' },
      { name: 'Priya Sharma', email: 'patient2@thalai.com', bloodGroup: 'B+', city: 'Bangalore' },
      { name: 'Arjun Patel', email: 'patient3@thalai.com', bloodGroup: 'O-', city: 'Pune' },
      { name: 'Sneha Reddy', email: 'patient4@thalai.com', bloodGroup: 'A+', city: 'Hyderabad' },
      { name: 'Amit Singh', email: 'patient5@thalai.com', bloodGroup: 'AB+', city: 'Mumbai' },
      { name: 'Neha Gupta', email: 'patient6@thalai.com', bloodGroup: 'O+', city: 'Chennai' },
      { name: 'Karan Malhotra', email: 'patient7@thalai.com', bloodGroup: 'B-', city: 'Kolkata' },
      { name: 'Pooja Iyer', email: 'patient8@thalai.com', bloodGroup: 'A-', city: 'Bangalore' },
      { name: 'Rahul Verma', email: 'patient9@thalai.com', bloodGroup: 'AB-', city: 'Delhi' },
      { name: 'Ananya Das', email: 'patient10@thalai.com', bloodGroup: 'O-', city: 'Mumbai' }
    ];

    const patients = [];
    for (let i = 0; i < patientData.length; i++) {
      const p = patientData[i];
      const user = await User.create({
        name: p.name,
        email: p.email,
        password: 'password123',
        role: 'patient',
        bloodGroup: p.bloodGroup,
        phone: `+91-98765432${10 + i}`,
        address: { street: `${100 + i} Patient St`, city: p.city, state: 'India', zipCode: `${400001 + i}` },
        dateOfBirth: new Date(`201${i % 6}-0${(i % 9) + 1}-15`),
        isActive: true
      });

      const transfusions = [];
      for (let j = 0; j < 5; j++) {
        transfusions.push({
          date: new Date(Date.now() - (30 + j * 30) * 24 * 60 * 60 * 1000),
          units: Math.floor(1 + Math.random() * 2),
          hb_value: (7 + Math.random() * 3).toFixed(1),
          notes: `Transfusion #${5 - j}`,
          hospital: `${p.city} Medical Center`,
          doctor: `Dr. ${['Sharma', 'Patel', 'Kumar'][j % 3]}`
        });
      }

      const patient = await Patient.create({
        user: user._id,
        transfusionHistory: transfusions,
        lastTransfusionDate: transfusions[0].date,
        medicalReports: generatePatientReports(10),
        currentHb: (7 + Math.random() * 3).toFixed(1),
        currentHbDate: new Date()
      });

      // Assign patients to doctors (roughly 3-4 per doctor)
      const assignedDoctorUser = doctors[i % doctors.length];
      const doctorDoc = await Doctor.findOne({ user: assignedDoctorUser._id });
      await doctorDoc.assignPatient(patient._id, admin._id, 'Assigned during seeding');
      await doctorDoc.save();

      patients.push(user);
    }
    console.log(`✅ ${patients.length} patients created & assigned to doctors`);

    // 10 Donors
    const donorData = [
      { name: 'Vikram Singh', email: 'donor1@thalai.com', bloodGroup: 'O+', city: 'Mumbai', verified: true, eligible: true },
      { name: 'Anita Reddy', email: 'donor2@thalai.com', bloodGroup: 'A+', city: 'Mumbai', verified: true, eligible: true },
      { name: 'Ramesh Iyer', email: 'donor3@thalai.com', bloodGroup: 'B+', city: 'Delhi', verified: true, eligible: false },
      { name: 'Sunita Mehta', email: 'donor4@thalai.com', bloodGroup: 'AB+', city: 'Bangalore', verified: true, eligible: true },
      { name: 'Mohammed Ali', email: 'donor5@thalai.com', bloodGroup: 'O-', city: 'Pune', verified: true, eligible: true },
      { name: 'Kavita Desai', email: 'donor6@thalai.com', bloodGroup: 'A-', city: 'Mumbai', verified: false, eligible: false },
      { name: 'Suresh Kumar', email: 'donor7@thalai.com', bloodGroup: 'B-', city: 'Delhi', verified: false, eligible: false },
      { name: 'Deepa Nair', email: 'donor8@thalai.com', bloodGroup: 'AB-', city: 'Chennai', verified: true, eligible: true },
      { name: 'Arun Joshi', email: 'donor9@thalai.com', bloodGroup: 'O+', city: 'Hyderabad', verified: true, eligible: true },
      { name: 'Meera Kapoor', email: 'donor10@thalai.com', bloodGroup: 'A+', city: 'Kolkata', verified: true, eligible: false }
    ];

    const donors = [];
    for (let i = 0; i < donorData.length; i++) {
      const d = donorData[i];
      const user = await User.create({
        name: d.name,
        email: d.email,
        password: 'password123',
        role: 'donor',
        bloodGroup: d.bloodGroup,
        phone: `+91-98765432${20 + i}`,
        address: { street: `${200 + i} Donor St`, city: d.city, state: 'India', zipCode: `${500001 + i}` },
        dateOfBirth: new Date(`198${i % 10}-0${(i % 9) + 1}-15`),
        isActive: true
      });

      const lastDonationDays = d.eligible ? 95 + Math.floor(Math.random() * 100) : 45;

      await Donor.create({
        user: user._id,
        dob: user.dateOfBirth,
        heightCm: Math.floor(160 + Math.random() * 25),
        weightKg: Math.floor(55 + Math.random() * 30),
        medicalHistory: [],
        medicalReports: generateDonorReports(10),
        lastDonationDate: d.verified ? new Date(Date.now() - lastDonationDays * 24 * 60 * 60 * 1000) : null,
        donationFrequencyMonths: 3,
        totalDonations: d.verified ? Math.floor(2 + Math.random() * 10) : 0,
        availabilityStatus: d.verified && d.eligible,
        isVerified: d.verified,
        verifiedAt: d.verified ? new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) : null,
        verifiedBy: d.verified ? admin._id : null,
        healthClearance: d.verified,
        eligibilityStatus: d.eligible ? 'eligible' : (d.verified ? 'ineligible' : 'deferred'),
        eligibilityReason: d.eligible ? 'All checks passed' : (d.verified ? 'Donation interval not met' : 'Pending review'),
        eligibilityLastChecked: new Date(),
        notes: d.verified ? 'Verified donor' : 'Pending verification'
      });

      donors.push({ ...user.toObject(), verified: d.verified, eligible: d.eligible });
    }
    console.log(`✅ ${donors.length} donors created`);

    // Requests
    const requests = [];
    for (let i = 0; i < 10; i++) {
      const patient = patients[i];
      requests.push({
        patientId: patient._id,
        bloodGroup: patient.bloodGroup,
        unitsRequired: Math.floor(1 + Math.random() * 3),
        urgency: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        status: ['pending', 'searching', 'completed', 'cancelled'][Math.floor(Math.random() * 4)],
        location: {
          hospital: `${patient.address.city} Medical Center`,
          address: patient.address.street,
          city: patient.address.city,
          state: patient.address.state,
          zipCode: patient.address.zipCode
        },
        contactPerson: {
          name: `Guardian of ${patient.name}`,
          phone: patient.phone,
          relationship: 'Parent'
        },
        notes: `Transfusion for ${patient.name}`
      });
    }

    await Request.insertMany(requests);
    console.log(`✅ ${requests.length} requests created`);

    // Appointments
    const appointments = [];
    // 5 Patient Appointments
    for (let i = 0; i < 5; i++) {
        appointments.push({
            user: patients[i]._id,
            doctor: doctors[i % doctors.length]._id,
            userRole: 'patient',
            date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
            time: `0${9 + i}:00`,
            reason: 'Regular thalassemia checkup and blood level review',
            status: i < 2 ? 'scheduled' : 'pending',
            notes: i === 0 ? 'Bring latest reports' : ''
        });
    }
    // 5 Donor Appointments
    for (let i = 0; i < 5; i++) {
        appointments.push({
            user: donors[i]._id,
            doctor: doctors[i % doctors.length]._id,
            userRole: 'donor',
            date: new Date(Date.now() + (i + 5) * 24 * 60 * 60 * 1000),
            time: `${10 + i}:30`,
            reason: 'Health clearance for upcoming blood donation',
            status: 'pending'
        });
    }
    await Appointment.insertMany(appointments);
    console.log(`✅ ${appointments.length} appointments created`);

    console.log('\n📊 SEED SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Users: ${1 + doctors.length + patients.length + donors.length}`);
    console.log(`   - Admin: 1`);
    console.log(`   - Doctors: ${doctors.length}`);
    console.log(`   - Patients: ${patients.length}`);
    console.log(`   - Donors: ${donors.length}`);
    console.log(`🩸 Donors: Verified ${donors.filter(d => d.verified).length}, Eligible ${donors.filter(d => d.eligible).length}`);
    console.log(`📋 Requests: ${requests.length}`);
    console.log(`📅 Appointments: ${appointments.length}`);
    console.log(` Medical Reports: ${(patients.length + donors.length) * 10}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🔑 CREDENTIALS:');
    console.log('Admin: admin@thalai.com / password123');
    console.log('Doctors: doctor1-3@thalai.com / password123');
    console.log('Patients: patient1-10@thalai.com / password123');
    console.log('Donors: donor1-10@thalai.com / password123\n');

    console.log('✅ Seed complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    console.log('🔄 Destroying data...');
    await connectDB();
    await new Promise(resolve => setTimeout(resolve, 2000));

    await User.deleteMany({});
    await Donor.deleteMany({});
    await Patient.deleteMany({});
    await Request.deleteMany({});
    await DonorHistory.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});

    console.log('✅ All data destroyed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d' || process.argv[2] === '--destroy') {
  destroyData();
} else {
  seedData();
}
