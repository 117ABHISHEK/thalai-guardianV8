import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../api/auth';
import { getDonorAvailability, updateDonorAvailability } from '../api/donor';
import StatCard from '../components/StatCard';
import HealthMetricsForm from '../components/HealthMetricsForm';

const DonorDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [donorProfile, setDonorProfile] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [availabilityForm, setAvailabilityForm] = useState({
    availabilityStatus: false,
    lastDonationDate: '',
  });
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, availabilityRes] = await Promise.all([
        getProfile(),
        getDonorAvailability(),
      ]);
      setProfile(profileRes.data.user);
      if (profileRes.data.donor) {
        setDonorProfile(profileRes.data.donor);
      }
      setAvailability(availabilityRes.data.donor);
      setFormData({
        name: profileRes.data.user.name || '',
        phone: profileRes.data.user.phone || '',
        street: profileRes.data.user.address?.street || '',
        city: profileRes.data.user.address?.city || '',
        state: profileRes.data.user.address?.state || '',
        zipCode: profileRes.data.user.address?.zipCode || '',
        dateOfBirth: profileRes.data.user.dateOfBirth
          ? new Date(profileRes.data.user.dateOfBirth).toISOString().split('T')[0]
          : '',
        bloodGroup: profileRes.data.user.bloodGroup || '',
      });
      setAvailabilityForm({
        availabilityStatus: availabilityRes.data.donor?.availabilityStatus || false,
        lastDonationDate: availabilityRes.data.donor?.lastDonationDate
          ? new Date(availabilityRes.data.donor.lastDonationDate).toISOString().split('T')[0]
          : '',
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvailabilityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAvailabilityForm({
      ...availabilityForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        dateOfBirth: formData.dateOfBirth,
        bloodGroup: formData.bloodGroup,
      };

      const response = await updateProfile(updateData);
      setProfile(response.data.user);
      updateUser(response.data.user);
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to update profile');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await updateDonorAvailability({
        availabilityStatus: availabilityForm.availabilityStatus,
        lastDonationDate: availabilityForm.lastDonationDate || undefined,
      });
      setAvailability(response.data.donor);
      setMessage('Availability updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to update availability');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleHealthMetricsUpdate = async (data) => {
    try {
      await updateProfile(data);
      await fetchData(); // Refresh data
      setMessage('Health metrics updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to update health metrics');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Donor Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${message.includes('success')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
              }`}
          >
            {message}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'profile', label: 'Profile' },
                { id: 'health', label: 'Health Reports' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? 'border-health-blue text-health-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            {availability && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                  title="Total Donations"
                  value={availability.totalDonations || 0}
                  icon="❤️"
                  color="red"
                />
                <StatCard
                  title="Availability Status"
                  value={availability.availabilityStatus ? 'Available' : 'Unavailable'}
                  icon={availability.availabilityStatus ? '✅' : '⏸️'}
                  color={availability.availabilityStatus ? 'green' : 'orange'}
                />
                <StatCard
                  title="Last Donation"
                  value={
                    availability.lastDonationDate
                      ? new Date(availability.lastDonationDate).toLocaleDateString()
                      : 'Never'
                  }
                  icon="📅"
                  color="blue"
                />
              </div>
            )}

            {/* Eligibility Status Card */}
            {donorProfile && (
              <div className="card mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Eligibility Status</h2>
                  <Link
                    to="/donor-profile"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    View Full Details →
                  </Link>
                </div>

                <div className="space-y-4">
                  {/* Overall Status */}
                  <div className="flex items-center gap-3">
                    <span className="text-gray-700 font-medium">Current Status:</span>
                    <span
                      className={`px-4 py-2 rounded-full font-semibold text-sm ${donorProfile.eligibilityStatus === 'eligible'
                          ? 'bg-green-100 text-green-800'
                          : donorProfile.eligibilityStatus === 'ineligible'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                    >
                      {donorProfile.eligibilityStatus === 'eligible' && '✅ Eligible'}
                      {donorProfile.eligibilityStatus === 'ineligible' && '❌ Ineligible'}
                      {donorProfile.eligibilityStatus === 'deferred' && '⏳ Pending Review'}
                    </span>
                  </div>

                  {/* Eligibility Reason */}
                  {donorProfile.eligibilityReason && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Reason:</span> {donorProfile.eligibilityReason}
                      </p>
                    </div>
                  )}

                  {/* Next Possible Donation Date */}
                  {donorProfile.nextPossibleDonationDate && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <span className="font-medium">Next Possible Donation:</span>{' '}
                        {new Date(donorProfile.nextPossibleDonationDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Quick Checks Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                    {donorProfile.isVerified ? (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <span>✅</span>
                        <span>Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-yellow-700">
                        <span>⏳</span>
                        <span>Pending Verification</span>
                      </div>
                    )}

                    {donorProfile.healthClearance ? (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <span>✅</span>
                        <span>Health Cleared</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-yellow-700">
                        <span>⏳</span>
                        <span>Clearance Pending</span>
                      </div>
                    )}

                    {donorProfile.medicalReports && donorProfile.medicalReports.length > 0 ? (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <span>✅</span>
                        <span>Reports Submitted</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-red-700">
                        <span>❌</span>
                        <span>No Reports</span>
                      </div>
                    )}
                  </div>

                  {/* Call to Action */}
                  {donorProfile.eligibilityStatus !== 'eligible' && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-600 mb-2">
                        To become eligible for donation:
                      </p>
                      <ul className="text-sm text-gray-700 space-y-1 ml-4">
                        {!donorProfile.isVerified && (
                          <li>• Wait for admin verification</li>
                        )}
                        {!donorProfile.healthClearance && (
                          <li>• Submit medical reports for health clearance</li>
                        )}
                        {(!donorProfile.medicalReports || donorProfile.medicalReports.length === 0) && (
                          <li>• Upload recent blood report (within 90 days)</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Availability Card */}
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Donor Availability</h2>
                <form onSubmit={handleAvailabilitySubmit} className="space-y-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="availabilityStatus"
                      checked={availabilityForm.availabilityStatus}
                      onChange={handleAvailabilityChange}
                      className="h-5 w-5 text-health-blue focus:ring-health-blue border-gray-300 rounded"
                    />
                    <label className="ml-3 text-gray-700 font-medium">
                      I am available for donation
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Donation Date
                    </label>
                    <input
                      type="date"
                      name="lastDonationDate"
                      value={availabilityForm.lastDonationDate}
                      onChange={handleAvailabilityChange}
                      className="input-field"
                    />
                  </div>

                  {availability && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Donations:</span>
                        <span className="font-semibold text-gray-900">{availability.totalDonations || 0}</span>
                      </div>
                      {availability.lastDonationDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Donation:</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(availability.lastDonationDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <button type="submit" className="w-full btn-primary">
                    Update Availability
                  </button>
                </form>
              </div>

              {/* Quick Links Card */}
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                <div className="space-y-4">
                  <Link
                    to="/donor-profile"
                    className="block w-full p-4 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-blue-900">View Eligibility Profile</h3>
                        <p className="text-sm text-blue-700">Check your donation eligibility status</p>
                      </div>
                      <span className="text-2xl">📋</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'profile' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
              <div className="flex gap-2">
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-primary"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Group
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="input-field"
                      required
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field"
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
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      fetchData();
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-lg font-semibold text-gray-900">{profile?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-semibold text-gray-900">{profile?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Blood Group</p>
                    <p className="text-lg font-semibold text-health-blue">{profile?.bloodGroup}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-lg font-semibold text-gray-900">{profile?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'health' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Health Reports & Metrics</h2>
            <HealthMetricsForm
              initialData={donorProfile}
              onSave={handleHealthMetricsUpdate}
              loading={loading}
              role="donor"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
