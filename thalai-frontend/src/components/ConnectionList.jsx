import { useState, useEffect } from 'react';
import api from '../api/auth';

const ConnectionList = ({ role }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await api.get('/connections');
      setConnections(response.data.data);
    } catch (err) {
      setError('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (id, status) => {
    try {
      setActionLoading(id);
      await api.patch(`/connections/${id}`, { status });
      fetchConnections();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update connection');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuggestCheckup = async (id) => {
    try {
      setActionLoading(id);
      const response = await api.post(`/connections/${id}/suggest-checkup`);
      alert(response.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to suggest checkup');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="text-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-blue mx-auto"></div></div>;

  const pendingRequests = connections.filter(c => c.status === 'pending');
  const activeConnections = connections.filter(c => c.status === 'active');

  return (
    <div className="space-y-8">
      {pendingRequests.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
            Pending Requests
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingRequests.map(conn => {
              const otherUser = role === 'patient' ? conn.donor : conn.patient;
              const isRequester = conn.requester === (role === 'patient' ? conn.patient?._id : conn.donor?._id);
              
              return (
                <div key={conn._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900">{otherUser?.name}</h4>
                      <p className="text-xs text-gray-500">{otherUser?.bloodGroup} • {role === 'patient' ? 'Donor' : 'Patient'}</p>
                      {conn.notes && <p className="text-sm mt-2 text-gray-600 italic">"{conn.notes}"</p>}
                    </div>
                    {isRequester ? (
                      <span className="text-[10px] font-bold uppercase bg-gray-100 text-gray-500 px-2 py-1 rounded-md">Requested by you</span>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleResponse(conn._id, 'active')}
                          disabled={actionLoading === conn._id}
                          className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleResponse(conn._id, 'declined')}
                          disabled={actionLoading === conn._id}
                          className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100 transition-all"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Connections</h3>
        {activeConnections.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500">No active connections found. You can connect with donors after a match!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeConnections.map(conn => {
              const otherUser = role === 'patient' ? conn.donor : conn.patient;
              return (
                <div key={conn._id} className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-health-blue/5 rounded-bl-full transform translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-health-blue/10 rounded-full flex items-center justify-center text-health-blue text-lg font-bold">
                        {otherUser?.name?.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 leading-none">{otherUser?.name}</h4>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{otherUser?.bloodGroup}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>📧</span> {otherUser?.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>📱</span> {otherUser?.phone}
                      </div>
                    </div>

                    <div className="flex gap-2">
                       {role === 'patient' && (
                         <button 
                           onClick={() => handleSuggestCheckup(conn._id)}
                           disabled={actionLoading === conn._id}
                           className="flex-1 py-2 bg-health-blue text-white text-xs font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-health-blue/20"
                         >
                           Suggest Checkup
                         </button>
                       )}
                       <a 
                         href={`tel:${otherUser?.phone}`}
                         className="flex-1 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all text-center"
                       >
                         Call Friend
                       </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ConnectionList;
