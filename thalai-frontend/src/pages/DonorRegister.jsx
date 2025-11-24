import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';

/**
 * Enhanced Donor Registration Form
 * Includes all donor-specific fields: DOB, height, weight, medical history, donation interval validation
 */
const DonorRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  
  // Pre-fill form if coming from general register page
  const preFillData = location.state?.formData || {};
  
  const [formData, setFormData] = useState({
    name: preFillData.name || '',
    email: preFillData.email || '',
    password: preFillData.password || '',
    confirmPassword: preFillData.confirmPassword || '',
    role: 'donor',
    bloodGroup: preFillData.bloodGroup || '',
    phone: preFillData.phone || '',
    street: preFillData.street || '',
    city: preFillData.city || '',
    state: preFillData.state || '',
    zipCode: preFillData.zipCode || '',
    dob: preFillData.dateOfBirth || preFillData.dob || '',
    heightCm: '',
    weightKg: '',
    donationFrequencyMonths: '3',
    lastDonationDate: '',
    medicalHistory: [{ condition: '', details: '', diagnosisDate: '', isContraindication: false }],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [nextPossibleDate, setNextPossibleDate] = useState(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Calculate age from DOB
  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Validate age (must be 18+ for donors)
  const validateAge = (dob) => {
    const age = calculateAge(dob);
    if (age !== null && age < 18) {
      return {
        valid: false,
        message: `You must be at least 18 years old to register as a donor. Current age: ${age} years`,
        age,
      };
    }
    return { valid: true, age };
  };

  // Validate donation interval (90-day rule)
  const validateDonationInterval = (lastDonationDate, frequencyMonths = 3) => {
    if (!lastDonationDate) return { valid: true };

    const today = new Date();
    const lastDate = new Date(lastDonationDate);
    const diffTime = today - lastDate;
    const daysSince = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const minIntervalDays = frequencyMonths * 30;

    if (daysSince < minIntervalDays) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + minIntervalDays);
      return {
        valid: false,
        message: `Minimum ${minIntervalDays} days must pass since last donation. ${daysSince} days have passed.`,
        daysSince,
        minIntervalDays,
        nextPossibleDate: nextDate.toISOString().split('T')[0],
      };
    }

    return { valid: true, daysSince };
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    // Basic required fields
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Blood group is required';

    // Donor-specific fields
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required for donors';
    } else {
      const ageValidation = validateAge(formData.dob);
      if (!ageValidation.valid) {
        newErrors.dob = ageValidation.message;
      }
    }

    if (!formData.heightCm) {
      newErrors.heightCm = 'Height is required';
    } else if (formData.heightCm < 50 || formData.heightCm > 250) {
      newErrors.heightCm = 'Height must be between 50 and 250 cm';
    }

    if (!formData.weightKg) {
      newErrors.weightKg = 'Weight is required';
    } else if (formData.weightKg < 20 || formData.weightKg > 250) {
      newErrors.weightKg = 'Weight must be between 20 and 250 kg';
    }

    if (formData.donationFrequencyMonths && formData.donationFrequencyMonths < 3) {
      newErrors.donationFrequencyMonths = 'Minimum donation frequency is 3 months';
    }

    // Validate donation interval if lastDonationDate is provided
    if (formData.lastDonationDate) {
      const intervalValidation = validateDonationInterval(
        formData.lastDonationDate,
        parseInt(formData.donationFrequencyMonths) || 3
      );
      if (!intervalValidation.valid) {
        newErrors.lastDonationDate = intervalValidation.message;
        setNextPossibleDate(intervalValidation.nextPossibleDate);
      } else {
        setNextPossibleDate(null);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleMedicalHistoryChange = (index, field, value) => {
    const newHistory = [...formData.medicalHistory];
    newHistory[index] = {
      ...newHistory[index],
      [field]: field === 'isContraindication' ? value === 'true' : value,
    };
    setFormData({ ...formData, medicalHistory: newHistory });
  };

  const addMedicalHistoryEntry = () => {
    setFormData({
      ...formData,
      medicalHistory: [
        ...formData.medicalHistory,
        { condition: '', details: '', diagnosisDate: '', isContraindication: false },
      ],
    });
  };

  const removeMedicalHistoryEntry = (index) => {
    const newHistory = formData.medicalHistory.filter((_, i) => i !== index);
    setFormData({ ...formData, medicalHistory: newHistory });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setNextPossibleDate(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'donor',
        bloodGroup: formData.bloodGroup,
        phone: formData.phone || undefined,
        address: {
          street: formData.street || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
        },
        dob: formData.dob,
        heightCm: parseFloat(formData.heightCm),
        weightKg: parseFloat(formData.weightKg),
        donationFrequencyMonths: parseInt(formData.donationFrequencyMonths) || 3,
        lastDonationDate: formData.lastDonationDate || undefined,
        medicalHistory: formData.medicalHistory.filter(
          (entry) => entry.condition.trim() !== ''
        ),
      };

      const response = await register(userData);
      await login({ email: formData.email, password: formData.password });
      navigate('/donor-dashboard');
    } catch (err) {
      const errorMessage = err.message || err.errors?.[0]?.message || 'Registration failed. Please try again.';
      setErrors({ submit: errorMessage });
      
      // Handle specific error codes
      if (err.error === 'DONATION_INTERVAL_NOT_MET' && err.nextPossibleDate) {
        setNextPossibleDate(err.nextPossibleDate);
      }
    } finally {
      setLoading(false);
    }
  };

  const age = formData.dob ? calculateAge(formData.dob) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-health-blue text-white p-3 rounded-xl">
              <span className="text-3xl">🩸</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900">Become a Donor</h2>
          <p className="mt-2 text-gray-600">Help save lives by donating blood</p>
        </div>

        <div className="card p-8">
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{errors.submit}</p>
              {nextPossibleDate && (
                <p className="mt-2 text-sm text-red-700">
                  Next possible donation date: <strong>{new Date(nextPossibleDate).toLocaleDateString()}</strong>
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group *
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className={`input-field ${errors.bloodGroup ? 'border-red-500' : ''}`}
                    required
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                  {errors.bloodGroup && <p className="text-red-500 text-sm mt-1">{errors.bloodGroup}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>

            {/* Donor-Specific Information */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Donor Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth * {age !== null && <span className="text-gray-500">(Age: {age} years)</span>}
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className={`input-field ${errors.dob ? 'border-red-500' : ''}`}
                    required
                    max={new Date().toISOString().split('T')[0]} // Cannot be future date
                  />
                  {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm) *
                  </label>
                  <input
                    type="number"
                    name="heightCm"
                    value={formData.heightCm}
                    onChange={handleChange}
                    className={`input-field ${errors.heightCm ? 'border-red-500' : ''}`}
                    min="50"
                    max="250"
                    required
                  />
                  {errors.heightCm && <p className="text-red-500 text-sm mt-1">{errors.heightCm}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    name="weightKg"
                    value={formData.weightKg}
                    onChange={handleChange}
                    className={`input-field ${errors.weightKg ? 'border-red-500' : ''}`}
                    min="20"
                    max="250"
                    step="0.1"
                    required
                  />
                  {errors.weightKg && <p className="text-red-500 text-sm mt-1">{errors.weightKg}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Donation Frequency (months) *
                  </label>
                  <input
                    type="number"
                    name="donationFrequencyMonths"
                    value={formData.donationFrequencyMonths}
                    onChange={handleChange}
                    className={`input-field ${errors.donationFrequencyMonths ? 'border-red-500' : ''}`}
                    min="3"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum: 3 months (90 days)</p>
                  {errors.donationFrequencyMonths && <p className="text-red-500 text-sm mt-1">{errors.donationFrequencyMonths}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Donation Date (if applicable)
                  </label>
                  <input
                    type="date"
                    name="lastDonationDate"
                    value={formData.lastDonationDate}
                    onChange={handleChange}
                    className={`input-field ${errors.lastDonationDate ? 'border-red-500' : ''}`}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.lastDonationDate && (
                    <div className="mt-1">
                      <p className="text-red-500 text-sm">{errors.lastDonationDate}</p>
                      {nextPossibleDate && (
                        <p className="text-sm text-blue-600 mt-1">
                          Next possible donation: <strong>{new Date(nextPossibleDate).toLocaleDateString()}</strong>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Address</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Medical History (Optional)</h3>
              {formData.medicalHistory.map((entry, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition
                      </label>
                      <input
                        type="text"
                        value={entry.condition}
                        onChange={(e) => handleMedicalHistoryChange(index, 'condition', e.target.value)}
                        className="input-field"
                        placeholder="e.g., High blood pressure"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diagnosis Date
                      </label>
                      <input
                        type="date"
                        value={entry.diagnosisDate}
                        onChange={(e) => handleMedicalHistoryChange(index, 'diagnosisDate', e.target.value)}
                        className="input-field"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Details
                      </label>
                      <textarea
                        value={entry.details}
                        onChange={(e) => handleMedicalHistoryChange(index, 'details', e.target.value)}
                        className="input-field"
                        rows="2"
                        placeholder="Additional details"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={entry.isContraindication}
                          onChange={(e) => handleMedicalHistoryChange(index, 'isContraindication', e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">This condition prevents donation (contraindication)</span>
                      </label>
                    </div>
                  </div>
                  {formData.medicalHistory.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicalHistoryEntry(index)}
                      className="mt-2 text-red-600 text-sm hover:text-red-800"
                    >
                      Remove Entry
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMedicalHistoryEntry}
                className="text-health-blue text-sm hover:text-blue-700"
              >
                + Add Medical History Entry
              </button>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4">
              <Link to="/login" className="text-health-blue hover:text-blue-700">
                Already have an account? Login
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Registering...' : 'Register as Donor'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DonorRegister;

