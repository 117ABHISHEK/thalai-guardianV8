import React, { useState, useEffect } from 'react';
import AppointmentList from '../components/AppointmentList';

const DoctorDashboard = () => {
  const [stats, setStats] = useState({
    activePatientsCount: 0,
    totalPatientsAssigned: 0,
    patientsNeedingTransfusionSoon: 0,
    isVerified: false
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('patients');

  // Hardcoded URL to prevent crash
  const API_BASE = 'http://localhost:5000/api/doctor';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch stats
      try {
        const statsRes = await fetch(`${API_BASE}/dashboard/stats`, { headers });
        if (statsRes.ok) {
            const data = await statsRes.json();
            if (data.data) setStats(data.data);
        } else {
            console.warn('Stats fetch failed:', statsRes.status);
        }
      } catch (e) {
        console.error('Stats fetch error:', e);
      }

      // Fetch patients
      try {
        const patientsRes = await fetch(`${API_BASE}/patients`, { headers });
        if (patientsRes.ok) {
            const data = await patientsRes.json();
            if (data.data && data.data.patients) {
                setPatients(data.data.patients);
            }
        }
      } catch (e) {
        console.error('Patients fetch error:', e);
      }

      setLoading(false);
    } catch (err) {
      console.error('General error:', err);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/patients/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setPatientDetails(data.data.patient);
        setSelectedPatient(patientId);
      } else {
        alert(data.message || 'Failed to load details');
      }
    } catch (err) {
      console.error('Error fetching details:', err);
      alert('Failed to load patient details');
    }
  };

  const updatePatientNotes = async (patientId, notes) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/patients/${patientId}/notes`, {
        method: 'PUT',
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes })
      });
      
      if (res.ok) {
        alert('Notes updated successfully');
        fetchDashboardData(); // Refresh
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update notes');
      }
    } catch (err) {
      console.error('Error updating notes:', err);
      alert('Failed to update notes');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold text-lg mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button onClick={fetchDashboardData} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your assigned patients</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('patients')}
            className={`py-4 px-6 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'patients' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
          >
            Assigned Patients
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-4 px-6 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'appointments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
          >
            Appointments
          </button>
        </div>

        {activeTab === 'patients' ? (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <span className="text-white text-xl">👥</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Patients</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.activePatientsCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <span className="text-white text-xl">📋</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Assigned</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalPatientsAssigned}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <span className="text-white text-xl">⚠️</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Needs Transfusion</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.patientsNeedingTransfusionSoon}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stats.isVerified ? 'bg-green-500' : 'bg-red-500'} rounded-md p-3`}>
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Verification</p>
                    <p className="text-lg font-semibold text-gray-900">{stats.isVerified ? 'Verified' : 'Pending'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Patients List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Assigned Patients</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No patients assigned yet.
                        </td>
                      </tr>
                    ) : (
                      patients.map((assignment) => (
                        <tr key={assignment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {assignment.patient?.user?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {assignment.patient?.user?.email || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {assignment.patient?.user?.bloodGroup || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(assignment.assignedDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              assignment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {assignment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => fetchPatientDetails(assignment.patient._id)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 font-display">Patient Appointments</h2>
            <AppointmentList role="doctor" />
          </div>
        )}

        {/* Patient Details Modal */}
        {selectedPatient && patientDetails && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Patient Details</h3>
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    setPatientDetails(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">Personal Information</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-sm font-medium">{patientDetails.user?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium">{patientDetails.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Blood Group</p>
                      <p className="text-sm font-medium">{patientDetails.user?.bloodGroup}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-sm font-medium">{patientDetails.user?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Medical Information</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Current Hemoglobin</p>
                      <p className="text-sm font-medium">{patientDetails.currentHb || 'N/A'} g/dL</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Transfusion</p>
                      <p className="text-sm font-medium">
                        {patientDetails.lastTransfusionDate
                          ? new Date(patientDetails.lastTransfusionDate).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Predicted Next Transfusion</p>
                      <p className="text-sm font-medium">
                        {patientDetails.predictedNextTransfusionDate
                          ? new Date(patientDetails.predictedNextTransfusionDate).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Transfusions</p>
                      <p className="text-sm font-medium">{patientDetails.transfusionHistory?.length || 0}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Notes</h4>
                  <textarea
                    className="w-full border border-gray-300 rounded-md p-2 text-sm"
                    rows="4"
                    placeholder="Add notes about this patient..."
                    defaultValue={patients.find(p => p.patient._id === selectedPatient)?.notes || ''}
                    id="patient-notes"
                  />
                  <button
                    onClick={() => {
                      const notes = document.getElementById('patient-notes').value;
                      updatePatientNotes(selectedPatient, notes);
                    }}
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
