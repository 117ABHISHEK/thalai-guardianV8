import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    bloodGroup: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.role || !formData.bloodGroup) {
      setError('Please fill all required fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateStep1()) {
      return;
    }

    // If role is 'donor', redirect to enhanced donor registration form
    if (formData.role === 'donor') {
      navigate('/register/donor', {
        state: {
          formData: {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
            role: formData.role,
            bloodGroup: formData.bloodGroup,
            phone: formData.phone,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            dateOfBirth: formData.dateOfBirth,
          },
        },
      });
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone || undefined,
        address: {
          street: formData.street || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
        },
        dateOfBirth: formData.dateOfBirth || undefined,
      };

      const response = await register(userData);
      await login({ email: formData.email, password: formData.password });
      navigate(`/${formData.role}-dashboard`);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-health-blue text-white p-3 rounded-xl">
              <span className="text-3xl">🩸</span>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900">Create Account</h2>
          <p className="mt-2 text-gray-600">Join ThalAI Guardian to save lives</p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className={`flex-1 ${step >= 1 ? 'text-health-blue' : 'text-gray-400'}`}>
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-health-blue text-white' : 'bg-gray-200'}`}>
                    {step > 1 ? '✓' : '1'}
                  </div>
                  <span className="ml-2 text-sm font-medium">Basic Info</span>
                </div>
              </div>
              <div className="flex-1 mx-2">
                <div className="h-1 bg-gray-200 rounded">
                  <div className={`h-1 rounded ${step >= 2 ? 'bg-health-blue' : 'bg-gray-200'}`} style={{ width: step >= 2 ? '100%' : '0%' }}></div>
                </div>
              </div>
              <div className={`flex-1 text-right ${step >= 2 ? 'text-health-blue' : 'text-gray-400'}`}>
                <div className="flex items-center justify-end">
                  <span className="mr-2 text-sm font-medium">Additional</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-health-blue text-white' : 'bg-gray-200'}`}>
                    2
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field"
                    placeholder="Enter your email"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="input-field"
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="input-field"
                    >
                      <option value="patient">Patient</option>
                      <option value="donor">Donor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      required
                      className="input-field"
                    >
                      <option value="">Select</option>
                      {bloodGroups.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full btn-primary"
                >
                  Continue
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Optional"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-health-blue hover:text-blue-700">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
