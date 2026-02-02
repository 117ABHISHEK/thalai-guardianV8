import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserRequests, cancelRequest } from '../api/requests';
import { findMatches } from '../api/match';
import RequestMatchesModal from '../components/RequestMatchesModal';
import { 
  RefreshCw, Search, Eye, X, Clock, 
  Droplets, MapPin, AlertCircle, CheckCircle2,
  MoreHorizontal, Navigation, Trash2, Activity, Zap, Hospital,
  Info, Share2, FileText
} from 'lucide-react';

const PatientRequestHistory = ({ onRequestCancelled }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [findingMatches, setFindingMatches] = useState({});
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [showMatchesModal, setShowMatchesModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 45000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await getUserRequests(user._id || user.id);
      setRequests(response.data.requests || []);
    } catch (err) {
      setError(err.message || 'Failed to load transmission history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Terminate this blood acquisition cycle?')) return;
    try {
      await cancelRequest(requestId);
      setMessage('Cycle terminated successfully');
      fetchRequests();
      if (onRequestCancelled) onRequestCancelled();
    } catch (err) {
      setError(err.message || 'Termination failed');
    }
  };

  const handleFindMatches = async (requestId) => {
    try {
      setFindingMatches(prev => ({ ...prev, [requestId]: true }));
      await findMatches(requestId);
      setMessage('Network searched. Matching heroes notified.');
      fetchRequests();
    } catch (err) {
      setError('Matching protocol failed.');
    } finally {
      setFindingMatches(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: 'bg-amber-500/10 text-amber-600 border-amber-200',
      searching: 'bg-sky-500/10 text-sky-600 border-sky-200 animate-pulse',
      completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
      cancelled: 'bg-slate-500/10 text-slate-600 border-slate-200',
    };
    return styles[status] || styles.pending;
  };

  const getUrgencyStyle = (urgency) => {
    const styles = {
      low: 'text-emerald-500',
      medium: 'text-amber-500',
      high: 'text-rose-500',
      critical: 'text-white bg-rose-500 px-2 rounded font-black',
    };
    return styles[urgency] || styles.medium;
  };

  if (loading) return (
    <div className="p-20 text-center">
       <div className="w-16 h-16 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
       <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Neural History...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-reveal">
      <div className="flex justify-between items-center mb-10">
         <div>
            <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">Transmission <span className="text-sky-500">History</span></h2>
            <p className="text-slate-500 font-medium">Log of all active and historical blood requirements.</p>
         </div>
         <button onClick={fetchRequests} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 hover:text-sky-500 hover:border-sky-100 transition-all active:scale-95 group">
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
         </button>
      </div>

      {(message || error) && (
        <div className={`p-4 rounded-2xl border ${error ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'} flex items-center gap-3 text-sm font-bold`}>
           <Zap className="w-4 h-4" /> {message || error}
           <button onClick={() => {setMessage(''); setError('');}} className="ml-auto opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="py-20 text-center card-premium bg-slate-50/50 border-dashed border-2">
           <Activity className="w-16 h-16 text-slate-200 mx-auto mb-4" />
           <p className="text-slate-400 font-bold">No historical data available.</p>
           <p className="text-xs text-slate-400 uppercase tracking-widest mt-2 font-black">Link a new requirement to begin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
           {requests.map((req) => (
              <div key={req._id} className={`card-premium group hover:shadow-2xl hover:shadow-slate-200/50 transition-all border border-slate-100 relative ${activeDropdown === req._id ? 'z-50' : 'z-10'}`}>
                 <div className="absolute top-4 right-4 z-20">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === req._id ? null : req._id)}
                      className={`p-2 rounded-xl transition-all ${activeDropdown === req._id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-300 hover:text-slate-600'}`}
                    >
                       <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {activeDropdown === req._id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2.5 z-50 animate-reveal">
                           <button 
                             onClick={() => { setSelectedRequest(req); setShowDetailsModal(true); setActiveDropdown(null); }}
                             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                           >
                              <Info className="w-4 h-4" /> Request Profile
                           </button>
                           <button 
                             onClick={() => { alert('Emergency broadcast link copied'); setActiveDropdown(null); }}
                             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                           >
                              <Share2 className="w-4 h-4" /> Broadcast Share
                           </button>
                           <button 
                             onClick={() => { alert('Downloading clinical requirement PDF...'); setActiveDropdown(null); }}
                             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                           >
                              <FileText className="w-4 h-4" /> Vital Report
                           </button>
                           <div className="h-[1px] bg-slate-50 my-1.5 mx-2" />
                           <p className="px-4 py-1 text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">REF: #{req._id.slice(-8)}</p>
                        </div>
                      </>
                    )}
                 </div>
                 
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-slate-900/10">
                          {req.bloodGroup}
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-1">
                             <span className={`px-3 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(req.status)}`}>
                                {req.status}
                             </span>
                             <span className={`text-[10px] font-black uppercase tracking-widest ${getUrgencyStyle(req.urgency)}`}>
                                {req.urgency} priority
                             </span>
                          </div>
                          <h4 className="text-xl font-display font-black text-slate-900 leading-none mb-1">{req.unitsRequired} Units Required</h4>
                          <p className="text-slate-400 text-xs font-bold flex items-center gap-1">
                             <Clock className="w-3 h-3" /> Registered: {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                       </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-right md:pr-16">
                       <div className="flex items-center gap-2 text-slate-600">
                          <Hospital className="w-4 h-4 text-sky-400" />
                          <span className="font-bold text-sm tracking-tight">{req.location?.hospital || 'Clinical Hub'}</span>
                       </div>
                       <div className="flex items-center gap-2 text-slate-400">
                          <MapPin className="w-3 h-3" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{req.location?.city}, {req.location?.state}</span>
                       </div>
                    </div>
                 </div>

                 <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap gap-3">
                    {req.status !== 'cancelled' && req.status !== 'completed' && (
                       <>
                          <button onClick={() => handleFindMatches(req._id)} disabled={findingMatches[req._id]} className="flex-1 py-3 px-6 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/10 active:scale-95 disabled:opacity-50">
                             {findingMatches[req._id] ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                             Neural Network Search
                          </button>
                          <button onClick={() => { setSelectedRequestId(req._id); setShowMatchesModal(true); }} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-sky-500 hover:text-sky-500 transition-all flex items-center gap-2 active:scale-95 shadow-sm">
                             <Eye className="w-4 h-4" /> Review Matches
                          </button>
                          <button onClick={() => handleCancel(req._id)} className="px-4 py-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all active:scale-95 group">
                             <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                          </button>
                       </>
                    )}
                    {(req.status === 'cancelled' || req.status === 'completed') && (
                       <div className="w-full flex justify-between items-center text-slate-400">
                          <span className="text-[10px] font-black uppercase tracking-widest italic">
                             Log terminalized at {new Date(req.updatedAt).toLocaleDateString()}
                          </span>
                          <CheckCircle2 className={`w-5 h-5 ${req.status === 'completed' ? 'text-emerald-400' : 'text-slate-300'}`} />
                       </div>
                    )}
                 </div>
              </div>
           ))}
        </div>
      )}

      {showMatchesModal && (
        <RequestMatchesModal
          requestId={selectedRequestId}
          onClose={() => setShowMatchesModal(false)}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-reveal">
           <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
              <div className="p-10 bg-slate-900 text-white relative">
                  <button onClick={() => setShowDetailsModal(false)} className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                     <X className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-5 mb-6">
                     <div className="w-16 h-16 bg-sky-500 rounded-3xl flex items-center justify-center text-white text-3xl font-black">
                        {selectedRequest.bloodGroup}
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.3em] mb-1">Clinical Requirement</p>
                        <h3 className="text-3xl font-display font-black tracking-tight">Transmission #{selectedRequest._id.slice(-6)}</h3>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(selectedRequest.status)}`}>
                        {selectedRequest.status}
                     </span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                        Priority: {selectedRequest.urgency}
                     </span>
                  </div>
              </div>

              <div className="p-10 space-y-10">
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <Hospital className="w-3.5 h-3.5" /> Healthcare Node
                          </p>
                          <p className="text-xl font-bold text-slate-900 leading-tight">{selectedRequest.location?.hospital}</p>
                          <p className="text-sm font-medium text-slate-500 mt-1">{selectedRequest.location?.city}, {selectedRequest.location?.state}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <Activity className="w-3.5 h-3.5" /> Volume Required
                          </p>
                          <p className="text-2xl font-black text-slate-900">{selectedRequest.unitsRequired} Units <span className="text-sm font-bold text-slate-400">Total</span></p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <Clock className="w-3.5 h-3.5" /> Registry Sync
                          </p>
                          <p className="text-sm font-semibold text-slate-900">{new Date(selectedRequest.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                          <p className="text-sm font-medium text-slate-500">{new Date(selectedRequest.createdAt).toLocaleTimeString()}</p>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Ref</p>
                          <p className="text-xs font-mono font-bold text-slate-900 break-all">{selectedRequest._id}</p>
                       </div>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-slate-100">
                    <button onClick={() => setShowDetailsModal(false)} className="w-full btn-primary py-5 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-sky-500/20">
                       Acknowledge and Close
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PatientRequestHistory;
