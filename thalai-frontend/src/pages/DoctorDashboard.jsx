import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getDoctorStats, getAssignedPatients, getPatientDetails, updatePatientNotes as apiUpdateNotes, updatePatientMedicalData } from '../api/doctor';
import AppointmentList from '../components/AppointmentList';
import NotificationList from '../components/NotificationList';

const DoctorDashboard = () => {
  const location = useLocation();
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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statsRes = await getDoctorStats();
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      const patientsRes = await getAssignedPatients();
      if (patientsRes.data.success) {
        setPatients(patientsRes.data.data.patients);
      }

      setLoading(false);
    } catch (err) {
      console.error('General error:', err);
      setError(err.message || 'Failed to load dashboard data');
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      const res = await getPatientDetails(patientId);
      if (res.data.success) {
        setPatientDetails(res.data.data.patient);
        setSelectedPatient(patientId);
      }
    } catch (err) {
      console.error('Error fetching details:', err);
      alert(err.message || 'Failed to load patient details');
    }
  };

  const updatePatientNotes = async (patientId, notes) => {
    try {
      const res = await apiUpdateNotes(patientId, notes);
      if (res.data.success) {
        alert('Notes updated successfully');
        fetchDashboardData(); // Refresh
      }
    } catch (err) {
      console.error('Error updating notes:', err);
      alert(err.message || 'Failed to update notes');
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
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-4 px-6 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'notifications' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
          >
            Notifications
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
        ) : activeTab === 'appointments' ? (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 font-display">Patient Appointments</h2>
            <AppointmentList role="doctor" />
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 font-display">Your Notifications</h2>
            <NotificationList />
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
                    rows="2"
                    placeholder="Add notes about this patient..."
                    defaultValue={patients.find(p => p.patient._id === selectedPatient)?.notes || ''}
                    id="patient-notes"
                  />
                  <button
                    onClick={() => {
                      const notes = document.getElementById('patient-notes').value;
                      updatePatientNotes(selectedPatient, notes);
                    }}
                    className="mt-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
                  >
                    Save Notes
                  </button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Record New Transfusion</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500">Date</label>
                      <input type="date" id="t-date" className="w-full text-xs p-1 border rounded" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Units</label>
                      <input type="number" id="t-units" className="w-full text-xs p-1 border rounded" defaultValue="1" min="1" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Hb (g/dL)</label>
                      <input type="number" id="t-hb" className="w-full text-xs p-1 border rounded" step="0.1" placeholder="e.g. 9.5" />
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      const date = document.getElementById('t-date').value;
                      const units = document.getElementById('t-units').value;
                      const hb = document.getElementById('t-hb').value;
                      
                      if (!hb) {
                        alert('Hb value is required');
                        return;
                      }

                      try {
                        const newHistory = [...(patientDetails.transfusionHistory || []), {
                          date: new Date(date),
                          units: parseInt(units),
                          hb_value: parseFloat(hb),
                          doctor: stats.name || 'Assigned Doctor'
                        }];
                        
                        const res = await updatePatientMedicalData(selectedPatient, { 
                          transfusionHistory: newHistory,
                          currentHb: parseFloat(hb) 
                        });
                        
                        if (res.data.success) {
                          alert('Transfusion logged successfully');
                          // Simple way to refresh: refetch current patient details and dashboard stats
                          fetchPatientDetails(selectedPatient);
                          fetchDashboardData();
                        }
                      } catch (err) {
                        console.error('Error logging transfusion:', err);
                        alert(err.response?.data?.message || 'Error logging transfusion');
                      }
                    }}
                    className="mt-2 text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
                  >
                    Log Transfusion
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
