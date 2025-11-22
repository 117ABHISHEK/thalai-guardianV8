import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../api/auth';
import { getDonorAvailability, updateDonorAvailability } from '../api/donor';
import StatCard from '../components/StatCard';

const DonorDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [availabilityForm, setAvailabilityForm] = useState({
    availabilityStatus: false,
    lastDonationDate: '',
  });
  const [message, setMessage] = useState('');

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
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes('success')
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message}
          </div>
        )}

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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile Card */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-primary"
                >
                  Edit Profile
                </button>
              )}
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
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
