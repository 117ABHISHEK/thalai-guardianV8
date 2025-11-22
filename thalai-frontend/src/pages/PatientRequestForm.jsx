import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createRequest } from '../api/requests';
import { getUserRequests } from '../api/requests';

const PatientRequestForm = ({ onRequestCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bloodGroup: user?.bloodGroup || '',
    unitsRequired: 1,
    urgency: 'medium',
    hospital: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    contactName: '',
    contactPhone: '',
    contactRelationship: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);

  useEffect(() => {
    checkActiveRequests();
  }, []);

  const checkActiveRequests = async () => {
    try {
      const response = await getUserRequests(user._id);
      const activeRequests = response.data.requests.filter(
        (req) => req.status === 'pending' || req.status === 'searching'
      );
      if (activeRequests.length > 0) {
        setHasActiveRequest(true);
        setActiveRequest(activeRequests[0]);
      }
    } catch (error) {
      console.error('Error checking active requests:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.bloodGroup) {
      newErrors.bloodGroup = 'Blood group is required';
    }
    if (!formData.unitsRequired || formData.unitsRequired < 1 || formData.unitsRequired > 10) {
      newErrors.unitsRequired = 'Units required must be between 1 and 10';
    }
    if (!formData.urgency) {
      newErrors.urgency = 'Urgency level is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validate()) return;

    setLoading(true);
    try {
      const requestData = {
        bloodGroup: formData.bloodGroup,
        unitsRequired: parseInt(formData.unitsRequired),
        urgency: formData.urgency,
        location: {
          hospital: formData.hospital || undefined,
          address: formData.address || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
        },
        contactPerson: {
          name: formData.contactName || undefined,
          phone: formData.contactPhone || undefined,
          relationship: formData.contactRelationship || undefined,
        },
        notes: formData.notes || undefined,
      };

      await createRequest(requestData);
      setMessage('Blood request created successfully!');
      setFormData({
        bloodGroup: user?.bloodGroup || '',
        unitsRequired: 1,
        urgency: 'medium',
        hospital: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        contactName: '',
        contactPhone: '',
        contactRelationship: '',
        notes: '',
      });
      if (onRequestCreated) onRequestCreated();
      await checkActiveRequests();
    } catch (error) {
      setMessage(error.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  if (hasActiveRequest) {
    return (
      <div className="card">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-xl font-bold text-yellow-800 mb-3">⚠️ Active Request Exists</h3>
          <p className="text-yellow-700 mb-4">
            You already have an active blood request. Please cancel it before creating a new one.
          </p>
          <div className="bg-white p-4 rounded-lg">
            <p className="text-sm"><strong>Status:</strong> {activeRequest.status}</p>
            <p className="text-sm"><strong>Blood Group:</strong> {activeRequest.bloodGroup}</p>
            <p className="text-sm"><strong>Units Required:</strong> {activeRequest.unitsRequired}</p>
            <p className="text-sm"><strong>Created:</strong> {new Date(activeRequest.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    );
  }

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Blood Request</h2>

      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.includes('success')
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Blood Group Required <span className="text-red-500">*</span>
            </label>
            <select
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
            {errors.bloodGroup && (
              <span className="text-red-500 text-sm mt-1 block">{errors.bloodGroup}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Units Required <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="unitsRequired"
              value={formData.unitsRequired}
              onChange={handleChange}
              min="1"
              max="10"
              className="input-field"
              required
            />
            {errors.unitsRequired && (
              <span className="text-red-500 text-sm mt-1 block">{errors.unitsRequired}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level <span className="text-red-500">*</span>
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            {errors.urgency && (
              <span className="text-red-500 text-sm mt-1 block">{errors.urgency}</span>
            )}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
              <input
                type="text"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter hospital name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input-field"
                placeholder="Street address"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
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
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Person (Optional)</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
              <input
                type="text"
                name="contactRelationship"
                value={formData.contactRelationship}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Family, Friend"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="input-field"
            rows="4"
            maxLength="500"
            placeholder="Any additional information..."
          />
          <span className="text-xs text-gray-500 mt-1 block">
            {formData.notes.length}/500 characters
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Request...' : 'Create Request'}
        </button>
      </form>
    </div>
  );
};

export default PatientRequestForm;
