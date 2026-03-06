const User = require('../models/userModel');
const Donor = require('../models/donorModel');
const Patient = require('../models/patientModel');
const Doctor = require('../models/doctorModel');
const { computeEligibility, validateDonorRegistration } = require('../services/eligibilityService');
const logger = require('../utils/logger');
const { updateTransfusionPrediction, getPredictionStatus: getPatientPrediction } = require('../utils/aiPrediction');

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

  // Allowed to register at any age, but cannot donate if < 18
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
      // Removed strict age blocking - allow registration but restricted donation (handled in model/service)

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
          dob: dob || dateOfBirth,
          parentDetails: req.body.parentDetails,
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

    // Send welcome notification (async)
    const { sendWelcomeNotification } = require('../services/notificationService');
    sendWelcomeNotification(user._id, user.name).catch(err => 
      console.error('Failed to send welcome notification:', err)
    );

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
        success: false,
        message: 'Invalid credentials', // Keeping it generic for security but handling lock logic
        errorType: 'INVALID_CREDENTIALS'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive',
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
      return res.status(401).json({
        success: false,
        message: `Account is temporarily locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`,
        lockUntil: user.lockUntil
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Increment login attempts
      // Use updateOne (no validators) — we only update tracking fields,
      // not any user-submitted data, so full re-validation is unnecessary
      // and would crash for users with legacy phone formats.
      user.loginAttempts += 1;

      // Lock account after 5 attempts
      if (user.loginAttempts >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await User.updateOne(
          { _id: user._id },
          { loginAttempts: 0, lockUntil }
        );

        return res.status(401).json({
          success: false,
          message: 'Too many failed login attempts. Your account has been locked for 15 minutes for security.',
          lockUntil
        });
      }

      await User.updateOne(
        { _id: user._id },
        { loginAttempts: user.loginAttempts }
      );

      const remainingAttempts = 5 - user.loginAttempts;
      return res.status(401).json({
        success: false,
        message: `Invalid credentials. ${remainingAttempts} attempts remaining before account lock.`,
        errorType: 'INVALID_CREDENTIALS'
      });
    }

    // Successful login - reset attempts and lock
    // Use updateOne to avoid triggering full-document validation on legacy
    // phone numbers that predate stricter validators.
    await User.updateOne(
      { _id: user._id },
      { loginAttempts: 0, $unset: { lockUntil: '' } }
    );

    // Generate token
    const token = user.generateToken();

    // Send login alert notification (async)
    const { sendLoginAlert } = require('../services/notificationService');
    sendLoginAlert(user._id, req.headers['user-agent'], req.ip).catch(err => 
      console.error('Failed to send login alert:', err)
    );

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
      success: false,
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
      roleData = await Patient.findOne({ user: user._id })
        .populate('medicalReports.addedBy', 'name role')
        .populate('transfusionHistory.addedBy', 'name role');
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
      profilePicture,
      // Health metrics
      heightCm,
      weightKg,
      medicalReports,
      // Patient specifically
      transfusionHistory,
      currentHb,
      comorbidities
    } = req.body;

    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;
    if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;
    if (profilePicture) updateFields.profilePicture = profilePicture;
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
      if (medicalReports) {
        patientUpdate.medicalReports = medicalReports.map(r => ({
          ...r,
          addedBy: r.addedBy || req.user._id
        }));
      }
      if (transfusionHistory) {
        patientUpdate.transfusionHistory = transfusionHistory.map(t => ({
          ...t,
          addedBy: t.addedBy || req.user._id
        }));
      }
      if (currentHb) {
        patientUpdate.currentHb = currentHb;
        patientUpdate.currentHbDate = new Date();
      }
      if (comorbidities) patientUpdate.comorbidities = comorbidities;
      if (req.body.parentDetails) patientUpdate.parentDetails = req.body.parentDetails;
      if (req.body.thalassemiaType) patientUpdate.thalassemiaType = req.body.thalassemiaType;
      if (req.body.splenectomy !== undefined) patientUpdate.splenectomy = req.body.splenectomy;
      if (req.body.dob) patientUpdate.dob = req.body.dob;

      const patient = await Patient.findOneAndUpdate(
        { user: user._id },
        { $set: patientUpdate },
        { new: true, runValidators: true }
      );

      // Trigger AI prediction asynchronously
      if (patient) {
        updateTransfusionPrediction(patient._id).catch(err => 
          console.error('AI Prediction background error:', err.message)
        );
      }
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


// @route   GET /api/auth/prediction-status
// @desc    Get current prediction status for logged-in patient
// @access  Private (Patient only)
const getPredictionStatus = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can access prediction status',
      });
    }

    const patient = await Patient.findOne({ user: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found',
      });
    }

    const result = await getPatientPrediction(patient._id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }

    res.status(200).json({
      success: true,
      data: result.prediction,
    });
  } catch (error) {
    console.error('Get prediction status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   POST /api/auth/trigger-prediction
// @desc    Manually trigger prediction update for logged-in patient
// @access  Private (Patient only)
const triggerPrediction = async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can trigger predictions',
      });
    }

    const patient = await Patient.findOne({ user: req.user._id });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found',
      });
    }

    const result = await updateTransfusionPrediction(patient._id);
    
    if (!result.success) {
      if (result.error === 'No transfusion history') {
        return res.status(200).json({
          success: true,
          message: 'Success: Add some records to start AI tracking',
          data: {
            predictionLastUpdated: new Date(),
            explanation: 'Add transfusion records to get AI-powered predictions'
          }
        });
      }
      return res.status(400).json({
        success: false,
        message: result.error || 'Failed to generate prediction',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Prediction updated successfully',
      data: result.prediction,
    });
  } catch (error) {
    console.error('Trigger prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @route   GET /api/auth/export-data
// @desc    Export user medical data (CSV or PDF)
// @access  Private
const exportData = async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let roleData = null;
    if (user.role === 'patient') {
      roleData = await Patient.findOne({ user: user._id });
      console.log('Patient data found:', roleData ? 'Yes' : 'No');
    } else if (user.role === 'donor') {
      roleData = await Donor.findOne({ user: user._id });
      console.log('Donor data found:', roleData ? 'Yes' : 'No');
      if (roleData) {
        console.log('Donor medical history count:', roleData.medicalHistory?.length || 0);
        console.log('Donor medical reports count:', roleData.medicalReports?.length || 0);
      }
    }
    
    console.log(`Exporting ${format} for ${user.role}:`, user.email);

    if (format === 'csv') {
      // Generate comprehensive CSV
      let csvContent = 'PERSONAL INFORMATION\n';
      csvContent += 'Field,Value\n';
      csvContent += `Name,${user.name}\n`;
      csvContent += `Email,${user.email}\n`;
      csvContent += `Role,${user.role}\n`;
      csvContent += `Blood Group,${user.bloodGroup}\n`;
      csvContent += `Phone,${user.phone || 'N/A'}\n`;
      csvContent += `Date of Birth,${user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : 'N/A'}\n`;
      
      if (user.address) {
        csvContent += `Address,"${user.address.street || ''}, ${user.address.city || ''}, ${user.address.state || ''} ${user.address.zipCode || ''}"\n`;
      }
      
      if (roleData && user.role === 'patient') {
        // Patient-specific data
        csvContent += `\nCurrent Hemoglobin,${roleData.currentHb || 'N/A'} g/dL\n`;
        csvContent += `Thalassemia Type,${roleData.thalassemiaType || 'N/A'}\n`;
        csvContent += `Splenectomy,${roleData.splenectomy ? 'Yes' : 'No'}\n`;
        csvContent += `Height,${roleData.heightCm || 'N/A'} cm\n`;
        csvContent += `Weight,${roleData.weightKg || 'N/A'} kg\n`;

        // Transfusion History
        csvContent += '\n\nTRANSFUSION HISTORY\n';
        csvContent += 'Date,Units,Hemoglobin (g/dL),Location,Blood Group,Notes\n';
        if (roleData.transfusionHistory && roleData.transfusionHistory.length > 0) {
          roleData.transfusionHistory.forEach(t => {
            csvContent += `${new Date(t.date).toISOString().split('T')[0]},${t.units},${t.hb_value || 'N/A'},${t.location || 'N/A'},${t.bloodGroup || 'N/A'},"${t.notes || ''}"\n`;
          });
        } else {
          csvContent += 'No transfusion history recorded\n';
        }

        // Medical Reports
        csvContent += '\n\nMEDICAL REPORTS\n';
        csvContent += 'Date,Title,Hemoglobin,Ferritin,SGPT,SGOT,Creatinine,BP Systolic,BP Diastolic,Temperature,Height,Weight,Notes\n';
        if (roleData.medicalReports && roleData.medicalReports.length > 0) {
          roleData.medicalReports.forEach(r => {
            csvContent += `${new Date(r.reportDate).toISOString().split('T')[0]},${r.title || 'Medical Report'},${r.hemoglobin || 'N/A'},${r.ferritin || 'N/A'},${r.sgpt || 'N/A'},${r.sgot || 'N/A'},${r.creatinine || 'N/A'},${r.bpSystolic || 'N/A'},${r.bpDiastolic || 'N/A'},${r.temperature || 'N/A'},${r.heightCm || 'N/A'},${r.weightKg || 'N/A'},"${r.notes || ''}"\n`;
          });
        } else {
          csvContent += 'No medical reports recorded\n';
        }

        // Comorbidities
        if (roleData.comorbidities && roleData.comorbidities.length > 0) {
          csvContent += '\n\nCOMORBIDITIES\n';
          csvContent += 'Condition,Diagnosis Date,Treatment,Notes\n';
          roleData.comorbidities.forEach(c => {
            csvContent += `${c.condition},${c.diagnosisDate ? new Date(c.diagnosisDate).toISOString().split('T')[0] : 'N/A'},${c.treatment || 'N/A'},"${c.notes || ''}"\n`;
          });
        }

        // AI Prediction
        if (roleData.predictedNextTransfusionDate) {
          csvContent += '\n\nAI PREDICTION\n';
          csvContent += 'Field,Value\n';
          csvContent += `Predicted Next Transfusion,${new Date(roleData.predictedNextTransfusionDate).toISOString().split('T')[0]}\n`;
          csvContent += `Confidence,${roleData.predictionConfidence ? (roleData.predictionConfidence * 100).toFixed(0) + '%' : 'N/A'}\n`;
          csvContent += `Explanation,"${roleData.predictionExplanation || 'N/A'}"\n`;
          csvContent += `Last Updated,${roleData.predictionLastUpdated ? new Date(roleData.predictionLastUpdated).toISOString().split('T')[0] : 'N/A'}\n`;
        }
      } else if (roleData && user.role === 'donor') {
        // Donor-specific data
        csvContent += `\nHeight,${roleData.heightCm || 'N/A'} cm\n`;
        csvContent += `Weight,${roleData.weightKg || 'N/A'} kg\n`;
        csvContent += `Last Donation Date,${roleData.lastDonationDate ? new Date(roleData.lastDonationDate).toISOString().split('T')[0] : 'Never'}\n`;
        csvContent += `Total Donations,${roleData.totalDonations || 0}\n`;
        csvContent += `Availability Status,${roleData.availabilityStatus ? 'Available' : 'Not Available'}\n`;
        csvContent += `Eligibility Status,${roleData.eligibilityStatus || 'N/A'}\n`;
        csvContent += `Next Possible Donation,${roleData.nextPossibleDonationDate ? new Date(roleData.nextPossibleDonationDate).toISOString().split('T')[0] : 'N/A'}\n`;

        // Medical History
        if (roleData.medicalHistory && roleData.medicalHistory.length > 0) {
          csvContent += '\n\nMEDICAL HISTORY\n';
          csvContent += 'Condition,Details,Diagnosis Date,Contraindication\n';
          roleData.medicalHistory.forEach(m => {
            csvContent += `${m.condition},"${m.details || ''}",${m.diagnosisDate ? new Date(m.diagnosisDate).toISOString().split('T')[0] : 'N/A'},${m.isContraindication ? 'Yes' : 'No'}\n`;
          });
        }

        // Medical Reports
        if (roleData.medicalReports && roleData.medicalReports.length > 0) {
          csvContent += '\n\nMEDICAL REPORTS\n';
          csvContent += 'Date,Title,Hemoglobin,BP Systolic,BP Diastolic,Pulse,Temperature,Height,Weight,Notes\n';
          roleData.medicalReports.forEach(r => {
            csvContent += `${new Date(r.reportDate).toISOString().split('T')[0]},${r.title || 'Report'},${r.hemoglobin || 'N/A'},${r.bpSystolic || 'N/A'},${r.bpDiastolic || 'N/A'},${r.pulseRate || 'N/A'},${r.temperature || 'N/A'},${r.heightCm || 'N/A'},${r.weightKg || 'N/A'},"${r.notes || ''}"\n`;
          });
        }
      }

      csvContent += `\n\nExport Generated: ${new Date().toLocaleString()}\n`;
      csvContent += 'Source: ThalAI Guardian Medical Records System\n';

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=thalai-medical-records-${Date.now()}.csv`);
      res.send(csvContent);
    } else if (format === 'pdf') {
      // Generate comprehensive text-based PDF content
      let textContent = `
═══════════════════════════════════════════════════════════════
                    THALAI GUARDIAN
              COMPREHENSIVE MEDICAL RECORDS EXPORT
═══════════════════════════════════════════════════════════════

Generated: ${new Date().toLocaleString()}
Export Format: PDF (Text-Based)

───────────────────────────────────────────────────────────────
PERSONAL INFORMATION
───────────────────────────────────────────────────────────────

Name:              ${user.name}
Email:             ${user.email}
Role:              ${user.role.toUpperCase()}
Blood Group:       ${user.bloodGroup}
Phone:             ${user.phone || 'Not Provided'}
Date of Birth:     ${user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not Provided'}
Address:           ${user.address ? `${user.address.street || ''}, ${user.address.city || ''}, ${user.address.state || ''} ${user.address.zipCode || ''}`.trim() : 'Not Provided'}

`;

      if (roleData && user.role === 'patient') {
        textContent += `───────────────────────────────────────────────────────────────
PATIENT PROFILE
───────────────────────────────────────────────────────────────

Current Hemoglobin:        ${roleData.currentHb || 'N/A'} g/dL
Thalassemia Type:          ${roleData.thalassemiaType || 'Not Specified'}
Splenectomy:               ${roleData.splenectomy ? 'Yes' : 'No'}
Height:                    ${roleData.heightCm || 'N/A'} cm
Weight:                    ${roleData.weightKg || 'N/A'} kg

`;

        // Transfusion History
        textContent += `───────────────────────────────────────────────────────────────
TRANSFUSION HISTORY (${roleData.transfusionHistory?.length || 0} Records)
───────────────────────────────────────────────────────────────

`;
        if (roleData.transfusionHistory && roleData.transfusionHistory.length > 0) {
          roleData.transfusionHistory.forEach((t, i) => {
            textContent += `${i + 1}. Date: ${new Date(t.date).toLocaleDateString()}
   Units Transfused:  ${t.units}
   Hemoglobin Level:  ${t.hb_value || 'N/A'} g/dL
   Location:          ${t.location || 'Not Specified'}
   Blood Group:       ${t.bloodGroup || 'N/A'}
   Notes:             ${t.notes || 'None'}

`;
          });
        } else {
          textContent += `No transfusion history recorded.

`;
        }

        // Medical Reports
        textContent += `───────────────────────────────────────────────────────────────
MEDICAL REPORTS (${roleData.medicalReports?.length || 0} Records)
───────────────────────────────────────────────────────────────

`;
        if (roleData.medicalReports && roleData.medicalReports.length > 0) {
          roleData.medicalReports.forEach((r, i) => {
            textContent += `${i + 1}. Report Date: ${new Date(r.reportDate).toLocaleDateString()}
   Title:             ${r.title || 'Medical Report'}
   Hemoglobin:        ${r.hemoglobin || 'N/A'} g/dL
   Ferritin:          ${r.ferritin || 'N/A'} ng/mL
   SGPT:              ${r.sgpt || 'N/A'} U/L
   SGOT:              ${r.sgot || 'N/A'} U/L
   Creatinine:        ${r.creatinine || 'N/A'} mg/dL
   BP:                ${r.bpSystolic || 'N/A'}/${r.bpDiastolic || 'N/A'} mmHg
   Temperature:       ${r.temperature || 'N/A'} °C
   Height:            ${r.heightCm || 'N/A'} cm
   Weight:            ${r.weightKg || 'N/A'} kg
   Notes:             ${r.notes || 'None'}

`;
          });
        } else {
          textContent += `No medical reports recorded.

`;
        }

        // Comorbidities
        if (roleData.comorbidities && roleData.comorbidities.length > 0) {
          textContent += `───────────────────────────────────────────────────────────────
COMORBIDITIES (${roleData.comorbidities.length} Conditions)
───────────────────────────────────────────────────────────────

`;
          roleData.comorbidities.forEach((c, i) => {
            textContent += `${i + 1}. Condition:       ${c.condition}
   Diagnosis Date:  ${c.diagnosisDate ? new Date(c.diagnosisDate).toLocaleDateString() : 'Not Specified'}
   Treatment:       ${c.treatment || 'Not Specified'}
   Notes:           ${c.notes || 'None'}

`;
          });
        }

        // AI Prediction
        if (roleData.predictedNextTransfusionDate) {
          textContent += `───────────────────────────────────────────────────────────────
AI-POWERED TRANSFUSION PREDICTION
───────────────────────────────────────────────────────────────

Predicted Next Transfusion:  ${new Date(roleData.predictedNextTransfusionDate).toLocaleDateString()}
Confidence Level:            ${roleData.predictionConfidence ? (roleData.predictionConfidence * 100).toFixed(0) + '%' : 'N/A'}
Explanation:                 ${roleData.predictionExplanation || 'Not Available'}
Last Updated:                ${roleData.predictionLastUpdated ? new Date(roleData.predictionLastUpdated).toLocaleString() : 'N/A'}

`;
        }
      } else if (roleData && user.role === 'donor') {
        textContent += `───────────────────────────────────────────────────────────────
DONOR PROFILE
───────────────────────────────────────────────────────────────

Height:                    ${roleData.heightCm || 'N/A'} cm
Weight:                    ${roleData.weightKg || 'N/A'} kg
Last Donation Date:        ${roleData.lastDonationDate ? new Date(roleData.lastDonationDate).toLocaleDateString() : 'Never Donated'}
Total Donations:           ${roleData.totalDonations || 0}
Availability Status:       ${roleData.availabilityStatus ? 'AVAILABLE' : 'NOT AVAILABLE'}
Eligibility Status:        ${roleData.eligibilityStatus?.toUpperCase() || 'PENDING'}
Next Possible Donation:    ${roleData.nextPossibleDonationDate ? new Date(roleData.nextPossibleDonationDate).toLocaleDateString() : 'Not Calculated'}
Eligibility Reason:        ${roleData.eligibilityReason || 'Pending Review'}

`;

        // Medical History
        if (roleData.medicalHistory && roleData.medicalHistory.length > 0) {
          textContent += `───────────────────────────────────────────────────────────────
MEDICAL HISTORY (${roleData.medicalHistory.length} Conditions)
───────────────────────────────────────────────────────────────

`;
          roleData.medicalHistory.forEach((m, i) => {
            textContent += `${i + 1}. Condition:         ${m.condition}
   Details:           ${m.details || 'None'}
   Diagnosis Date:    ${m.diagnosisDate ? new Date(m.diagnosisDate).toLocaleDateString() : 'Not Specified'}
   Contraindication:  ${m.isContraindication ? 'YES - Prevents Donation' : 'No'}

`;
          });
        }

        // Medical Reports
        if (roleData.medicalReports && roleData.medicalReports.length > 0) {
          textContent += `───────────────────────────────────────────────────────────────
MEDICAL REPORTS (${roleData.medicalReports.length} Records)
───────────────────────────────────────────────────────────────

`;
          roleData.medicalReports.forEach((r, i) => {
            textContent += `${i + 1}. Report Date: ${new Date(r.reportDate).toLocaleDateString()}
   Title:             ${r.title || 'Medical Report'}
   Hemoglobin:        ${r.hemoglobin || 'N/A'} g/dL
   Blood Pressure:    ${r.bpSystolic || 'N/A'}/${r.bpDiastolic || 'N/A'} mmHg
   Pulse Rate:        ${r.pulseRate || 'N/A'} bpm
   Temperature:       ${r.temperature || 'N/A'} °C
   Height:            ${r.heightCm || 'N/A'} cm
   Weight:            ${r.weightKg || 'N/A'} kg
   Notes:             ${r.notes || 'None'}

`;
          });
        }
      }

      textContent += `═══════════════════════════════════════════════════════════════
                         END OF REPORT
═══════════════════════════════════════════════════════════════

This is an official medical records export from ThalAI Guardian.
For questions or concerns, please contact your healthcare provider.

Document ID: ${user._id}
Export Timestamp: ${new Date().toISOString()}
`;

      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=thalai-medical-records-${Date.now()}.txt`);
      res.send(textContent);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid format. Use "csv" or "pdf"',
      });
    }
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
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
  getPredictionStatus,
  triggerPrediction,
  changePassword,
  exportData,
};

