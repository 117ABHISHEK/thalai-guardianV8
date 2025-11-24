const User = require('../models/userModel');
const Donor = require('../models/donorModel');

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
    } = req.body;

    // Basic validation
    if (!name || !email || !password || !role || !bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, role, bloodGroup',
      });
    }

    // Validate role
    const validRoles = ['patient', 'donor', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be one of: patient, donor, admin',
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

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      bloodGroup,
      phone,
      address,
      dateOfBirth: dob || dateOfBirth, // Use dob if provided, else dateOfBirth
    });

    // Create role-specific profile
    if (role === 'donor') {
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

      // Compute initial eligibility
      await donorProfile.populate('user');
      const eligibility = computeEligibility(donorProfile);
      
      // Update donor with eligibility results
      donorProfile.eligibilityStatus = eligibility.eligible ? 'eligible' : 'deferred';
      donorProfile.eligibilityReason = eligibility.reason;
      donorProfile.nextPossibleDonationDate = eligibility.nextPossibleDate;
      donorProfile.eligibilityLastChecked = new Date();
      await donorProfile.save();
    } else if (role === 'patient') {
      // Create patient profile
      await Patient.create({
        user: user._id,
        transfusionHistory: [],
      });
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
    console.error('Registration error:', error);
    
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

    res.status(200).json({
      success: true,
      data: {
        user,
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
    const { name, phone, address, dateOfBirth, bloodGroup } = req.body;

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

