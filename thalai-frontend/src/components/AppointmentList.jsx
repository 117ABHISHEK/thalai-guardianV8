import { useState, useEffect } from 'react';
import api from '../api/auth';

const AppointmentList = ({ role }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({ date: '', time: '', notes: '', status: 'scheduled' });
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [role]);

  const fetchAppointments = async () => {
    try {
      let endpoint = '/appointments/my';
      if (role === 'doctor') endpoint = '/appointments/doctor';
      if (role === 'admin') endpoint = '/appointments/all';
      
      const response = await api.get(endpoint);
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      setUpdating(true);
      await api.patch(`/appointments/${id}`, { status });
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const openScheduleModal = (apt) => {
    setSelectedApt(apt);
    setScheduleData({
      date: apt.date ? new Date(apt.date).toISOString().split('T')[0] : '',
      time: apt.time || '',
      notes: apt.notes || '',
      status: 'scheduled'
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUpdating(true);
    try {
      await api.patch(`/appointments/${selectedApt._id}`, scheduleData);
      setShowScheduleModal(false);
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule appointment');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed_pending': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <div className="text-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-blue mx-auto"></div></div>;

  return (
    <div className="bg-white rounded-xl shadow-premium overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        {appointments.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50/50">
            <div className="text-3xl mb-2">📅</div>
            No appointments found.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {role === 'doctor' ? 'Requester' : (role === 'admin' ? 'Participants' : 'Doctor')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                {role !== 'admin' && <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((apt) => (
                <tr key={apt._id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {new Date(apt.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs font-medium text-health-blue bg-blue-50/50 px-2 py-0.5 rounded-full inline-block mt-1">
                      {apt.time?.includes(':') ? new Date(`2000-01-01T${apt.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : apt.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {role === 'doctor' ? apt.user?.name : (role === 'admin' ? `P: ${apt.user?.name} | D: ${apt.doctor?.name}` : `Dr. ${apt.doctor?.name}`)}
                    </div>
                    {role === 'doctor' && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tight ${apt.user?.role === 'patient' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'}`}>
                          {apt.user?.role}
                        </span>
                        <span className="text-xs text-gray-500">{apt.user?.bloodGroup}</span>
                      </div>
                    )}
                    {role !== 'doctor' && role !== 'admin' && (
                       <div className="text-xs text-gray-500 font-medium">Hematologist</div>
                    )}
                    {role === 'admin' && (
                       <div className="text-xs text-gray-500 italic">User: {apt.user?.role}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 capitalize">
                    <div className="text-sm text-gray-700 max-w-xs">{apt.reason}</div>
                    {apt.notes && <div className="text-[10px] text-gray-400 mt-1 italic line-clamp-1">Notes: {apt.notes}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getStatusColor(apt.status)}`}>
                      {apt.status === 'completed_pending' 
                        ? (role === 'doctor' ? 'Verification Sent' : 'Awaiting Your Confirmation') 
                        : (apt.status === 'scheduled' ? 'Scheduled' : apt.status)}
                    </span>
                  </td>
                  {role !== 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {role === 'doctor' && apt.status === 'pending' && (
                           <button onClick={() => openScheduleModal(apt)} disabled={updating} className="px-3 py-1.5 bg-health-blue text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all active:scale-95">
                             Accept & Schedule
                           </button>
                        )}
                        {role === 'doctor' && apt.status === 'scheduled' && (
                           <button onClick={() => handleStatusUpdate(apt._id, 'completed_pending')} disabled={updating} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm transition-all active:scale-95">
                             Mark Completed
                           </button>
                        )}
                        {role !== 'doctor' && apt.status === 'completed_pending' && (
                           <button onClick={() => handleStatusUpdate(apt._id, 'completed')} disabled={updating} className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-all active:scale-95">
                             Confirm Visit
                           </button>
                        )}
                        {apt.status !== 'cancelled' && apt.status !== 'completed' && apt.status !== 'completed_pending' && (
                           <button onClick={() => handleStatusUpdate(apt._id, 'cancelled')} disabled={updating} className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all active:scale-95">
                             Cancel
                           </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Schedule Appointment</h3>
              <p className="text-sm text-gray-500 mt-1">Review and set time for {selectedApt?.user?.name}</p>
            </div>
            
            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-800 text-sm rounded-lg border border-red-100 font-medium">{error}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Selected Date</label>
                  <input 
                    type="date" 
                    required
                    value={scheduleData.date}
                    onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-health-blue/20 outline-none hover:border-health-blue/30 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preferred Time</label>
                  <input 
                    type="time" 
                    required
                    value={scheduleData.time}
                    onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-health-blue/20 outline-none hover:border-health-blue/30 transition-all" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Preparation Notes</label>
                <textarea 
                  rows="3"
                  placeholder="Any instructions for the patient/donor..."
                  value={scheduleData.notes}
                  onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-health-blue/20 outline-none hover:border-health-blue/30 transition-all resize-none" 
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={updating}
                  className="flex-[2] py-3 text-sm font-bold text-white bg-health-blue rounded-xl hover:bg-blue-700 shadow-lg shadow-health-blue/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {updating ? 'Scheduling...' : 'Set Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentList;
