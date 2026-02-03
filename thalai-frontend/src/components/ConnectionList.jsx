import { useState, useEffect } from 'react';
import api from '../api/auth';
import { Mail, Phone, MoreVertical, XCircle, Info, ShieldAlert, Users } from 'lucide-react';

const ConnectionList = ({ role }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

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

  if (loading) return (
    <div className="text-center p-24">
      <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin mx-auto"></div>
    </div>
  );

  if (error && (!connections || connections.length === 0)) {
    return (
      <div className="text-center p-12 bg-rose-50 rounded-3xl border border-rose-100">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <p className="text-rose-800 font-bold">{error}</p>
        <button onClick={fetchConnections} className="mt-4 px-6 py-2 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest">Retry Connection</button>
      </div>
    );
  }

  const pendingRequests = Array.isArray(connections) ? connections.filter(c => c.status === 'pending') : [];
  const activeConnections = Array.isArray(connections) ? connections.filter(c => c.status === 'active') : [];

  return (
    <div className="space-y-12">
      {pendingRequests.length > 0 && (
        <section className="animate-reveal">
          <h3 className="text-xl font-display font-black text-slate-900 mb-6 flex items-center gap-3">
            <span className="w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/20"></span>
            Pending Connections
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {pendingRequests.map(conn => {
              const otherUser = role === 'patient' ? conn.donor : conn.patient;
              const isRequester = conn.requester === (role === 'patient' ? conn.patient?._id : conn.donor?._id) || conn.requester?._id === (role === 'patient' ? conn.patient?._id : conn.donor?._id);
              
              return (
                <div key={conn._id} className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 font-bold group-hover:bg-slate-900 group-hover:text-white transition-all">
                          {otherUser?.name?.charAt(0)}
                       </div>
                       <div>
                          <h4 className="font-black text-slate-900 text-lg group-hover:text-sky-600 transition-colors">{otherUser?.name}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{otherUser?.bloodGroup} • {role === 'patient' ? 'Donor Node' : 'Patient Node'}</p>
                       </div>
                    </div>
                    {isRequester ? (
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">Requested by you</span>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleResponse(conn._id, 'active')}
                          disabled={actionLoading === conn._id}
                          className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/10 transition-all active:scale-95 disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleResponse(conn._id, 'declined')}
                          disabled={actionLoading === conn._id}
                          className="px-4 py-2 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                  {conn.notes && (
                    <div className="mt-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm text-slate-500 font-medium">
                      "{conn.notes}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="animate-reveal" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-xl font-display font-black text-slate-900 mb-6 flex items-center gap-3">
           <span className="w-3 h-3 bg-sky-500 rounded-full shadow-lg shadow-sky-500/20"></span>
           Active Social Support
        </h3>
        {activeConnections.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-slate-200">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Users className="w-8 h-8" />
             </div>
            <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">No active circles identified.</p>
            <p className="text-sm text-slate-400 mt-2 px-12">Connect with verified donors or patients after a successful match operation.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeConnections.map(conn => {
              const otherUser = role === 'patient' ? conn.donor : conn.patient;
              return (
                <div key={conn._id} className={`bg-white p-7 rounded-[40px] border border-slate-100 shadow-sm group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 relative overflow-visible ${activeDropdown === conn._id ? 'z-50' : 'z-10'}`}>
                  
                  <div className="absolute top-6 right-6">
                     <button 
                       onClick={() => setActiveDropdown(activeDropdown === conn._id ? null : conn._id)}
                       className={`p-2 rounded-xl transition-all ${activeDropdown === conn._id ? 'bg-slate-900 text-white' : 'text-slate-300 hover:text-slate-600'}`}
                     >
                        <MoreVertical className="w-5 h-5" />
                     </button>
                     {activeDropdown === conn._id && (
                        <>
                           <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                           <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2.5 z-50 animate-reveal">
                              <button onClick={() => { alert('Accessing connection logs...'); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
                                 <Info className="w-4 h-4" /> Integrity Log
                              </button>
                              <button onClick={() => { alert('Reporting node for audit...'); setActiveDropdown(null); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all">
                                 <ShieldAlert className="w-4 h-4" /> Report Node
                              </button>
                              <div className="h-[1px] bg-slate-50 my-2 mx-2" />
                              <button onClick={() => handleResponse(conn._id, 'declined')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-rose-600 transition-all">
                                 <XCircle className="w-4 h-4" /> Disconnect
                              </button>
                           </div>
                        </>
                     )}
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-slate-900 rounded-[22px] flex items-center justify-center text-white text-xl font-black shadow-xl shadow-slate-900/10 group-hover:scale-105 transition-transform">
                      {otherUser?.name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-display font-black text-slate-900 text-lg leading-none mb-1 group-hover:text-sky-600 transition-colors">{otherUser?.name}</h4>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{otherUser?.bloodGroup} Type</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                      <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors"><Mail className="w-4 h-4" /></div>
                      <span className="truncate">{otherUser?.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                      <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors"><Phone className="w-4 h-4" /></div>
                      <span>{otherUser?.phone || 'Syncing...'}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                     {role === 'patient' && (
                       <button 
                         onClick={() => handleSuggestCheckup(conn._id)}
                         disabled={actionLoading === conn._id}
                         className="flex-[2] py-4 bg-sky-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-sky-600 active:scale-95 transition-all shadow-xl shadow-sky-500/10"
                       >
                         Request Checkup
                       </button>
                     )}
                     <a 
                       href={`tel:${otherUser?.phone}`}
                       className="flex-1 py-4 bg-white border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:text-slate-900 hover:bg-slate-50 active:scale-95 transition-all text-center flex items-center justify-center"
                     >
                        Sync Call
                     </a>
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
