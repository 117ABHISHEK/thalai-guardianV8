import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllRequests, cancelRequest } from '../api/requests';
import { 
  ArrowLeft, RefreshCw, Filter, Search, 
  Trash2, CheckCircle2, AlertTriangle, 
  Droplets, Hospital, MapPin, User, 
  Clock, X, Zap, Activity, Info, MoreHorizontal
} from 'lucide-react';
import api from '../api/auth';

import { createPortal } from 'react-dom';

const AdminRequestManager = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    bloodGroup: '',
    urgency: '',
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 45000);
    return () => clearInterval(interval);
  }, [filters]);

  const fetchRequests = async () => {
    try {
      const response = await getAllRequests(filters);
      setRequests(response.data.requests || []);
    } catch (err) {
      setError(err.message || 'Failed to sync requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleUrgentDispatch = async (reqId) => {
    try {
      if (!window.confirm('Initiate emergency dispatch protocol for this requirement?')) return;
      await api.patch(`/requests/${reqId}/urgency`, { urgency: 'emergency' });
      alert('Emergency dispatch protocol initiated. Global response network alerted.');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Dispatch escalation failed.');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Terminate this clinical request permanently?')) return;
    try {
      await cancelRequest(requestId);
      setMessage('Request terminated successfully');
      setTimeout(() => setMessage(''), 3000);
      fetchRequests();
    } catch (err) {
      setError('Termination failed.');
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
      critical: 'text-white bg-rose-500 px-2 rounded font-black animate-pulse',
    };
    return styles[urgency] || styles.medium;
  };

  if (loading && requests.length === 0) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
       <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
    </div>
  );

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="min-h-screen bg-transparent pt-12 pb-32 px-6 lg:px-12 relative animate-slide-up">
      {/* Local administrative blur removed */}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 animate-reveal">
           <div>
              <button 
                onClick={() => navigate('/admin-dashboard')} 
                className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px] mb-4 hover:text-sky-500 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Admin Command
              </button>
              <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight leading-none mb-4 flex items-center gap-3">
                 <Droplets className="w-10 h-10 text-rose-500" /> Request <span className="text-rose-500">Pipeline</span>
              </h1>
              <p className="text-slate-500 font-medium">Global oversight of all active and historical blood requirements.</p>
           </div>
           
           <button onClick={fetchRequests} className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-sky-200 hover:text-sky-500 transition-all active:scale-95 group">
              <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
           </button>
        </div>

        {(message || error) && (
          <div className={`p-6 rounded-[32px] border ${error ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'} mb-10 flex items-center gap-4 animate-reveal shadow-lg shadow-slate-200/50`}>
             {error ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
             <span className="font-bold text-sm tracking-tight">{message || error}</span>
             <button onClick={() => {setMessage(''); setError('');}} className="ml-auto opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Global Filter Bar */}
        <div className="card-premium bg-white/80 backdrop-blur-md mb-10 animate-reveal" style={{ animationDelay: '0.1s' }}>
           <div className="flex flex-wrap items-end gap-6 p-2">
              <div className="flex-1 min-w-[200px] space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-1">
                    <Filter className="w-3 h-3" /> Status Protocol
                 </label>
                 <select name="status" value={filters.status} onChange={handleFilterChange} className="input-field bg-slate-50/50">
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="searching">Searching</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                 </select>
              </div>
              <div className="flex-1 min-w-[150px] space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-1">
                    <Droplets className="w-3 h-3" /> Biological Type
                 </label>
                 <select name="bloodGroup" value={filters.bloodGroup} onChange={handleFilterChange} className="input-field bg-slate-50/50">
                    <option value="">All Groups</option>
                    {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                 </select>
              </div>
              <div className="flex-1 min-w-[150px] space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 px-1">
                    <Zap className="w-3 h-3" /> Priority Scale
                 </label>
                 <select name="urgency" value={filters.urgency} onChange={handleFilterChange} className="input-field bg-slate-50/50">
                    <option value="">All Urgencies</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                 </select>
              </div>
              <button 
                onClick={() => setFilters({ status: '', bloodGroup: '', urgency: '' })}
                className="h-12 px-6 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50 bg-slate-50 rounded-2xl transition-all"
              >
                 Reset Filters
              </button>
           </div>
        </div>

        {/* Request Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-reveal" style={{ animationDelay: '0.2s' }}>
           {requests.length === 0 ? (
              <div className="lg:col-span-2 py-24 text-center card-premium bg-white border-dashed border-2">
                 <Activity className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                 <h3 className="text-xl font-display font-black text-slate-900 mb-2">Registry Inactive</h3>
                 <p className="text-slate-500 font-medium px-12">No blood requirements match your current administrative filter.</p>
              </div>
           ) : (
              requests.map((req) => (
                 <div key={req._id} className={`card-premium h-full group hover:shadow-2xl hover:shadow-slate-200/50 transition-all border border-white bg-white/80 backdrop-blur-sm flex flex-col justify-between overflow-visible relative ${activeDropdown === req._id ? 'z-50' : 'z-10'}`}>
                    <div className="absolute top-4 right-4 z-20">
                        <button 
                          onClick={() => setActiveDropdown(activeDropdown === req._id ? null : req._id)}
                          className={`p-2 rounded-xl transition-all ${activeDropdown === req._id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-300 hover:text-slate-600'}`}
                        >
                           <MoreHorizontal className="w-5 h-5" />
                        </button>

                        {activeDropdown === req._id && (
                          <>
                            <div className="fixed inset-0 z-[9998]" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} />
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2.5 z-[9999] animate-reveal">
                               <button 
                                 onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); setShowDetailsModal(true); setActiveDropdown(null); }}
                                 className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                               >
                                  <Info className="w-4 h-4" /> Clinical Protocol
                               </button>
                               <button 
                                 onClick={(e) => { e.stopPropagation(); handleUrgentDispatch(req._id); setActiveDropdown(null); }}
                                 className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                               >
                                  <Zap className="w-4 h-4" /> Urgent Dispatch
                               </button>
                               <div className="h-[1px] bg-slate-50 my-1.5 mx-2" />
                               <p className="px-4 py-1 text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">SYS: {req._id.slice(-12)}</p>
                            </div>
                          </>
                        )}
                     </div>

                    <div>
                       <div className="flex justify-between items-start mb-8">
                          <div className="flex items-center gap-4">
                             <div className="w-16 h-16 bg-slate-900 rounded-[32px] flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-slate-900/10 transition-transform group-hover:scale-105">
                                {req.bloodGroup}
                             </div>
                             <div>
                                <h3 className="text-lg font-display font-black text-slate-900 leading-none mb-1">{req.patientId?.name || 'Anonymous Patient'}</h3>
                                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 lowercase tracking-tight"><Info className="w-3 h-3" /> {req.patientId?.email || 'no-sync-email'}</p>
                             </div>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${getStatusStyle(req.status)}`}>
                             {req.status}
                          </div>
                       </div>

                       <div className="grid grid-cols-3 gap-4 mb-8">
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl text-center flex flex-col justify-center gap-1 group/item hover:bg-white transition-colors">
                             <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest group-hover/item:text-rose-500 transition-colors">Requirement</p>
                             <p className="font-black text-slate-900 text-lg">{req.unitsRequired} Units</p>
                          </div>
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl text-center flex flex-col justify-center gap-1 group/item hover:bg-white transition-colors">
                             <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest group-hover/item:text-rose-500 transition-colors">Urgency</p>
                             <p className={`font-black uppercase tracking-tight text-xs ${getUrgencyStyle(req.urgency)}`}>{req.urgency}</p>
                          </div>
                          <div className="p-4 bg-slate-50 border border-slate-100 rounded-3xl text-center flex flex-col justify-center gap-1 group/item hover:bg-white transition-colors">
                             <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest group-hover/item:text-rose-500 transition-colors">Distance</p>
                             <p className="font-black text-slate-900 text-xs truncate">{req.location?.city || 'Global'}</p>
                          </div>
                       </div>

                       <div className="space-y-3 mb-8">
                          <div className="flex items-center gap-3 text-slate-600">
                             <Hospital className="w-4 h-4 text-sky-400" />
                             <span className="text-xs font-bold truncate">{req.location?.hospital || 'Clinical Hub'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-400">
                             <Clock className="w-4 h-4" />
                             <span className="text-[10px] font-black uppercase tracking-widest">
                                Logged {new Date(req.createdAt).toLocaleDateString()} at {new Date(req.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                             </span>
                          </div>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex gap-3">
                       {req.status !== 'cancelled' && req.status !== 'completed' && (
                          <button 
                            onClick={() => handleCancel(req._id)}
                            className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-500/10 hover:bg-rose-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                             <Trash2 className="w-4 h-4" /> Terminate Pipeline
                          </button>
                       )}
                       <button onClick={() => { setSelectedRequest(req); setShowDetailsModal(true); }} className="px-6 py-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-sky-500 hover:border-sky-500 transition-all active:scale-95 group">
                          <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
                       </button>
                    </div>
                 </div>
              ))
           )}
        </div>
      </div>

      {/* Admin Protocol Modal */}
      {showDetailsModal && selectedRequest && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-reveal">
           <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
              <div className="p-10 bg-slate-900 text-white relative">
                  <button onClick={() => setShowDetailsModal(false)} className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                     <X className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-5 mb-6">
                     <div className="w-16 h-16 bg-rose-500 rounded-3xl flex items-center justify-center text-white text-3xl font-black">
                        {selectedRequest.bloodGroup}
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.3em] mb-1">Administrative Oversight</p>
                        <h3 className="text-3xl font-display font-black tracking-tight">Cycle #{selectedRequest._id.slice(-6)}</h3>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(selectedRequest.status)}`}>
                        {selectedRequest.status}
                     </span>
                  </div>
              </div>

              <div className="p-10 space-y-10">
                 <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-6">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subject Name</p>
                          <p className="text-xl font-bold text-slate-900 leading-tight">{selectedRequest.patientId?.name}</p>
                          <p className="text-sm font-medium text-slate-500 mt-1">{selectedRequest.patientId?.email}</p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Medical Node</p>
                          <p className="text-lg font-black text-slate-900">{selectedRequest.location?.hospital}</p>
                          <p className="text-xs font-bold text-slate-400">{selectedRequest.location?.city}, {selectedRequest.location?.state}</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Requirement Volume</p>
                          <p className="text-2xl font-black text-slate-900">{selectedRequest.unitsRequired} Units</p>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Global System ID</p>
                          <p className="text-xs font-mono font-bold text-slate-900 break-all">{selectedRequest._id}</p>
                       </div>
                    </div>
                 </div>

                 <div className="pt-8 border-t border-slate-100">
                    <button onClick={() => setShowDetailsModal(false)} className="w-full btn-primary py-5 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-rose-500/20 bg-slate-900">
                       Acknowledge Protocol
                    </button>
                 </div>
              </div>
           </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AdminRequestManager;
