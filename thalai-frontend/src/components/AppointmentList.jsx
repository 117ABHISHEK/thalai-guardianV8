import { useState, useEffect } from 'react';
import api from '../api/auth';

const AppointmentList = ({ role }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [role]);

  const fetchAppointments = async () => {
    try {
      const endpoint = role === 'doctor' ? '/appointments/doctor' : '/appointments/my';
      const response = await api.get(endpoint);
      setAppointments(response.data.data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <div className="text-center p-4">Loading appointments...</div>;

  return (
    <div className="overflow-x-auto">
      {appointments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No appointments found.
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {role === 'doctor' ? 'Patient' : 'Doctor'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((apt) => (
              <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {new Date(apt.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">{apt.time}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {role === 'doctor' ? apt.patient?.name : `Dr. ${apt.doctor?.name}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {role === 'doctor' ? apt.patient?.email : apt.doctor?.specialization}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 line-clamp-1">{apt.reason}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AppointmentList;
