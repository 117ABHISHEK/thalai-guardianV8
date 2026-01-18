const User = require('../models/userModel');
const Donor = require('../models/donorModel');
const Patient = require('../models/patientModel');
const Doctor = require('../models/doctorModel');
const { computeEligibility, validateDonorRegistration } = require('../services/eligibilityService');
const logger = require('../utils/logger');

// Helper validation functions
const validateDonorAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  if (age < 18) {
    return {
      valid: false,
      message: `Donor must be at least 18 years old. Current age: ${age} years`,
      age
    };
  }

  return { valid: true, age };
};

const validateDonationInterval = (lastDonationDate, donationFrequencyMonths = 3) => {
  const today = new Date();
  const lastDonation = new Date(lastDonationDate);
  const daysSince = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
  const minIntervalDays = donationFrequencyMonths * 30;

  if (daysSince < minIntervalDays) {
    const nextPossibleDate = new Date(lastDonation);
    nextPossibleDate.setDate(nextPossibleDate.getDate() + minIntervalDays);

    return {
      valid: false,
      message: `Minimum ${minIntervalDays} days must pass since last donation. ${daysSince} days have passed. Next possible donation: ${nextPossibleDate.toISOString().split('T')[0]}`,
      daysSince,
      minIntervalDays,
      nextPossibleDate
    };
  }

  return { valid: true, daysSince, minIntervalDays };
};

// @route   POST /api/auth/register
// @desc    Register a new user (with enhanced donor validation)
// @access  Public
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      bloodGroup,
      phone,
      address,
      dateOfBirth,
      // Donor-specific fields
      dob,
      heightCm,
      weightKg,
      medicalHistory,
      lastDonationDate,
      donationFrequencyMonths,
      gender,
      // Doctor-specific fields
      licenseNumber,
      specialization,
      qualification,
      experience,
      hospital,
    } = req.body;

    // Basic validation
    if (!name || !email || !password || !role || !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, role, bloodGroup',
      });
    }

    // Validate role
    const validRoles = ['patient', 'donor', 'admin', 'doctor'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: patient, donor, admin, doctor',
      });
    }

    // Validate blood group
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blood group',
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Donor-specific validation
    if (role === 'donor') {
      // Validate donor age (must be >= 18)
      const donorDob = dob || dateOfBirth;
      if (!donorDob) {
        return res.status(400).json({
          success: false,
          message: 'Date of birth (dob) is required for donor registration',
        });
      }

      const ageValidation = validateDonorAge(donorDob);
      if (!ageValidation.valid) {
        return res.status(400).json({
          success: false,
          message: ageValidation.message,
          error: 'AGE_REQUIREMENT_NOT_MET',
        });
      }

      // Validate required donor fields
      if (!heightCm || !weightKg) {
        return res.status(400).json({
          success: false,
          message: 'Height (heightCm) and weight (weightKg) are required for donor registration',
        });
      }

      // Validate donation interval (90-day rule)
      if (lastDonationDate) {
        const intervalValidation = validateDonationInterval(
          lastDonationDate,
          donationFrequencyMonths || 3
        );
        if (!intervalValidation.valid) {
          return res.status(422).json({
            success: false,
            message: intervalValidation.message,
            nextPossibleDate: intervalValidation.nextPossibleDate,
            daysSince: intervalValidation.daysSince,
            minIntervalDays: intervalValidation.minIntervalDays,
            error: 'DONATION_INTERVAL_NOT_MET',
          });
        }
      }

      // Comprehensive donor validation
      const donorValidation = validateDonorRegistration({
        dob: donorDob,
        heightCm,
        weightKg,
        lastDonationDate,
        donationFrequencyMonths: donationFrequencyMonths || 3,
      });

      if (!donorValidation.valid) {
        return res.status(422).json({
          success: false,
          message: 'Donor registration validation failed',
          errors: donorValidation.errors,
        });
      }
    }

    // Log registration attempt
    logger.info('Registration attempt', { email, role });

    // Create user
    let user;
    try {
      user = await User.create({
        name,
        email,
        password,
        role,
        bloodGroup,
        phone,
        address,
        dateOfBirth: dob || dateOfBirth, // Use dob if provided, else dateOfBirth
      });
      logger.info('User created successfully', { userId: user._id, email, role });
    } catch (userError) {
      console.error('❌ User creation error:', userError);
      logger.error('User creation error', { error: userError.message, stack: userError.stack, email });
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account',
        error: userError.message,
      });
    }

    // Create role-specific profile
    if (role === 'donor') {
      try {
        const donorProfile = await Donor.create({
          user: user._id,
          dob: dob || dateOfBirth,
          heightCm,
          weightKg,
          medicalHistory: medicalHistory || [],
          lastDonationDate: lastDonationDate || null,
          donationFrequencyMonths: donationFrequencyMonths || 3,
          availabilityStatus: false,
          eligibilityStatus: 'deferred', // Starts as deferred until admin review
          eligibilityReason: 'Pending admin review and health clearance',
        });
        logger.info('Donor profile created', { donorId: donorProfile._id, userId: user._id });

        // Compute initial eligibility with error handling
        await donorProfile.populate('user');
        
        let eligibility;
        try {
          eligibility = computeEligibility(donorProfile);
          
          // Update donor with eligibility results
          donorProfile.eligibilityStatus = eligibility.eligible ? 'eligible' : 'deferred';
          donorProfile.eligibilityReason = eligibility.reason;
          donorProfile.nextPossibleDonationDate = eligibility.nextPossibleDate;
          donorProfile.eligibilityLastChecked = new Date();
          
          logger.info('Eligibility computed', { donorId: donorProfile._id, eligible: eligibility.eligible });
        } catch (eligibilityError) {
          logger.error('Eligibility computation error during registration', { 
            error: eligibilityError.message,
            stack: eligibilityError.stack,
            donorId: donorProfile._id,
            userId: user._id 
          });
          
          // Set default deferred status if computation fails
          donorProfile.eligibilityStatus = 'deferred';
          donorProfile.eligibilityReason = 'Pending admin review and health clearance';
          donorProfile.eligibilityLastChecked = new Date();
        }
        
        await donorProfile.save();
        logger.info('Donor profile saved', { donorId: donorProfile._id });
        
      } catch (donorError) {
        console.error('❌ Donor profile creation error:', donorError);
        logger.error('Donor profile creation error', { 
          error: donorError.message, 
          stack: donorError.stack,
          userId: user._id 
        });
        
        // Clean up user if donor profile creation fails
        await User.findByIdAndDelete(user._id);
        
        return res.status(500).json({
          success: false,
          message: 'Failed to create donor profile',
          error: donorError.message,
        });
      }
    } else if (role === 'patient') {
      try {
        // Create patient profile
        await Patient.create({
          user: user._id,
          transfusionHistory: [],
        });
        logger.info('Patient profile created', { userId: user._id });
      } catch (patientError) {
        logger.error('Patient profile creation error', { 
          error: patientError.message,
          stack: patientError.stack,
          userId: user._id 
        });
        
        // Clean up user if patient profile creation fails
        await User.findByIdAndDelete(user._id);
        
        return res.status(500).json({
          success: false,
          message: 'Failed to create patient profile',
          error: patientError.message,
        });
      }
    } else if (role === 'doctor') {
      try {
        // Validate required doctor fields
        if (!licenseNumber || !specialization || !qualification) {
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            success: false,
            message: 'License number, specialization, and qualification are required for doctor registration',
          });
        }

        // Check if license number already exists
        const existingDoctor = await Doctor.findOne({ licenseNumber });
        if (existingDoctor) {
          await User.findByIdAndDelete(user._id);
          return res.status(400).json({
            success: false,
            message: 'A doctor with this license number already exists',
          });
        }

        // Create doctor profile
        await Doctor.create({
          user: user._id,
          licenseNumber,
          specialization: specialization || 'Hematology',
          qualification,
          experience: experience || 0,
          hospital: hospital || {},
          isVerified: false,
        });
        logger.info('Doctor profile created', { userId: user._id, licenseNumber });
      } catch (doctorError) {
        logger.error('Doctor profile creation error', { 
          error: doctorError.message,
          stack: doctorError.stack,
          userId: user._id 
        });
        
        // Clean up user if doctor profile creation fails
        await User.findByIdAndDelete(user._id);
        
        return res.status(500).json({
          success: false,
          message: 'Failed to create doctor profile',
          error: doctorError.message,
        });
      }
    }

    // Generate token
    const token = user.generateToken();

    // Log registration
    logger.logRegistration(user._id, role, user.email, {
      bloodGroup: user.bloodGroup,
      isDonor: role === 'donor',
      isPatient: role === 'patient',
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bloodGroup: user.bloodGroup,
        },
        token,
      },
    });
  } catch (error) {
    console.error('❌ MAIN CATCH - Registration error:', error);
    console.error('Error details:', { name: error.name, message: error.message, stack: error.stack });

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message,
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        message: 'User account is inactive',
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = user.generateToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          bloodGroup: user.bloodGroup,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    let roleData = null;
    if (user.role === 'donor') {
      roleData = await Donor.findOne({ user: user._id });
    } else if (user.role === 'patient') {
      roleData = await Patient.findOne({ user: user._id });
    } else if (user.role === 'doctor') {
      roleData = await Doctor.findOne({ user: user._id }).populate('assignedPatients.patient');
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        [user.role]: roleData,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      address,
      dateOfBirth,
      bloodGroup,
      // Health metrics
      heightCm,
      weightKg,
      medicalReports
    } = req.body;

    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;
    if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
    if (bloodGroup) {
      const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
      if (validBloodGroups.includes(bloodGroup)) {
        updateFields.bloodGroup = bloodGroup;
      } else {
        return res.status(400).json({
          message: 'Invalid blood group',
        });
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    // Update role-specific profile
    if (user.role === 'donor') {
      const donorUpdate = {};
      if (heightCm) donorUpdate.heightCm = heightCm;
      if (weightKg) donorUpdate.weightKg = weightKg;
      if (medicalReports) donorUpdate.medicalReports = medicalReports;

      await Donor.findOneAndUpdate(
        { user: user._id },
        { $set: donorUpdate },
        { new: true, runValidators: true }
      );
    } else if (user.role === 'patient') {
      const patientUpdate = {};
      if (heightCm) patientUpdate.heightCm = heightCm;
      if (weightKg) patientUpdate.weightKg = weightKg;
      if (medicalReports) patientUpdate.medicalReports = medicalReports;

      await Patient.findOneAndUpdate(
        { user: user._id },
        { $set: patientUpdate },
        { new: true, runValidators: true }
      );
    } else if (user.role === 'doctor') {
      const doctorUpdate = {};
      const { specialization, qualification, experience, hospital, availability, consultationHours } = req.body;
      
      if (specialization) doctorUpdate.specialization = specialization;
      if (qualification) doctorUpdate.qualification = qualification;
      if (experience !== undefined) doctorUpdate.experience = experience;
      if (hospital) doctorUpdate.hospital = hospital;
      if (availability) doctorUpdate.availability = availability;
      if (consultationHours) doctorUpdate.consultationHours = consultationHours;

      await Doctor.findOneAndUpdate(
        { user: user._id },
        { $set: doctorUpdate },
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};

