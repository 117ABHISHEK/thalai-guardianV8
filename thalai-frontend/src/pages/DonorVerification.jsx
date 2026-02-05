import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDonors, verifyDonor } from '../api/admin';
import { 
  RefreshCw, CheckCircle, AlertTriangle, 
  ArrowLeft, Users, Filter, Search, 
  Mail, Phone, Activity, ShieldCheck,
  MoreVertical, CheckCircle2, Info, X
} from 'lucide-react';

const DonorVerification = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedHero, setSelectedHero] = useState(null);

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await getDonors();
      setDonors(response.data.donors || []);
    } catch (err) {
      setError(err.message || 'Failed to synchronize hero data.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (donorId) => {
    try {
      await verifyDonor(donorId);
      setMessage('Donor identity verified & synced.');
      setTimeout(() => setMessage(''), 3000);
      fetchDonors();
    } catch (err) {
      setError('Verification protocol failed.');
    }
  };

  const handleDownloadContactHistory = (donor) => {
    const historyData = {
      donorId: donor._id,
      name: donor.user?.name,
      contact: {
        email: donor.user?.email,
        phone: donor.user?.phone
      },
      verificationStatus: donor.isVerified ? 'Verified' : 'Pending',
      lastSynced: new Date().toISOString(),
      logs: [
        { event: 'Registry Initialization', timestamp: donor.createdAt },
        { event: 'Contact Synchronization', timestamp: new Date().toISOString() }
      ]
    };
    
    const blob = new Blob([JSON.stringify(historyData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contact-history-${donor._id.slice(-6)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredDonors = donors.filter((donor) => {
    if (filter === 'verified') return donor.isVerified;
    if (filter === 'unverified') return !donor.isVerified;
    return true;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
       <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-transparent pt-12 pb-32 px-6 lg:px-12 relative animate-slide-up">
      {/* Background decoration removed to reveal global system */}

      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 animate-reveal">
           <div>
              <button 
                onClick={() => navigate('/admin-dashboard')} 
                className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px] mb-4 hover:text-sky-500 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Admin Command
              </button>
              <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight leading-none mb-4 flex items-center gap-3">
                 <ShieldCheck className="w-10 h-10 text-emerald-500" /> Hero <span className="text-emerald-500">Verification</span>
              </h1>
              <p className="text-slate-500 font-medium">Validate and activate verified donor status for the global response network.</p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                 {['all', 'unverified', 'verified'].map((f) => (
                    <button 
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                       {f}
                    </button>
                 ))}
              </div>
              <button onClick={fetchDonors} className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-sky-500 transition-all shadow-sm group">
                 <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
              </button>
           </div>
        </div>

        {(message || error) && (
          <div className={`p-6 rounded-[32px] border ${error ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'} mb-10 flex items-center gap-4 animate-reveal`}>
             {error ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
             <span className="font-bold text-sm">{message || error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 animate-reveal" style={{ animationDelay: '0.1s' }}>
           {filteredDonors.length === 0 ? (
              <div className="py-24 text-center card-premium bg-white border-dashed border-2">
                 <Users className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                 <h3 className="text-xl font-display font-black text-slate-900 mb-2">Registry Terminal Empty</h3>
                 <p className="text-slate-500 font-medium px-12">No hero profiles match your current verification filter.</p>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {filteredDonors.map((donor) => (
                    <div key={donor._id} className={`card-premium h-full group hover:shadow-2xl hover:shadow-slate-200/50 transition-all border border-white bg-white/80 backdrop-blur-sm flex flex-col justify-between relative ${activeDropdown === donor._id ? 'z-50' : 'z-10'}`}>
                       <div className="absolute top-4 right-4 group-hover:block">
                          <button 
                            onClick={() => setActiveDropdown(activeDropdown === donor._id ? null : donor._id)}
                            className={`p-2 rounded-xl transition-all ${activeDropdown === donor._id ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-300 hover:text-slate-600'}`}
                          >
                             <MoreVertical className="w-5 h-5" />
                          </button>

                          {activeDropdown === donor._id && (
                            <>
                              <div className="fixed inset-0 z-[9998]" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} />
                              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2.5 z-[9999] animate-reveal">
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); setSelectedHero(donor); setShowInfoModal(true); setActiveDropdown(null); }}
                                   className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                 >
                                    <Info className="w-4 h-4" /> Profile Intelligence
                                 </button>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleDownloadContactHistory(donor); setActiveDropdown(null); }}
                                   className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                 >
                                    <Phone className="w-4 h-4" /> Contact History
                                 </button>
                                 <div className="h-[1px] bg-slate-50 my-1.5 mx-2" />
                                 <p className="px-4 py-1 text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">NODE: {donor._id.slice(-12)}</p>
                              </div>
                            </>
                          )}
                       </div>

                       <div>
                          <div className="flex justify-between items-start mb-6">
                             <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black">
                                {donor.user?.bloodGroup}
                             </div>
                             <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${donor.isVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                {donor.isVerified ? 'Verified Hero' : 'Pending Review'}
                             </div>
                          </div>
                          
                          <div className="space-y-4 mb-8">
                             <div>
                                <h3 className="text-xl font-display font-black text-slate-900 mb-1">{donor.user?.name || 'Incomplete Profile'}</h3>
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                   <Mail className="w-3.5 h-3.5 text-sky-400" /> {donor.user?.email}
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                   <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Total Impact</p>
                                   <p className="font-black text-slate-900">{donor.totalDonations || 0} Cycles</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                                   <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Mass / HGT</p>
                                   <p className="font-black text-slate-900">{donor.weightKg || '--'}kg / {donor.heightCm || '--'}cm</p>
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="pt-6 border-t border-slate-100 space-y-4">
                          {!donor.isVerified ? (
                             <button 
                               onClick={() => handleVerify(donor._id)}
                               className="w-full btn-primary py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/10 bg-emerald-500 hover:bg-emerald-600"
                             >
                                <ShieldCheck className="w-4 h-4 mr-2" /> Activate Identity
                             </button>
                          ) : (
                             <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex flex-col gap-1 items-center">
                                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Administrative Sync Complete</span>
                                <p className="text-[8px] font-bold text-slate-400 italic">Verified by {donor.verifiedBy?.name || 'Neural AI'}</p>
                             </div>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
           )}
        </div>
      </div>

      {/* Hero Intelligence Modal */}
      {showInfoModal && selectedHero && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
              <div className="p-10 bg-slate-900 text-white relative">
                  <button onClick={() => setShowInfoModal(false)} className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                     <X className="w-6 h-6" />
                  </button>
                  <div className="flex items-center gap-5 mb-6">
                     <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center text-white text-3xl font-black">
                        {selectedHero.user?.bloodGroup}
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-1">Verified Donor Node</p>
                        <h3 className="text-3xl font-display font-black tracking-tight">{selectedHero.user?.name}</h3>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${selectedHero.isVerified ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-amber-500 text-white border-amber-400'}`}>
                        {selectedHero.isVerified ? 'Synchronized' : 'Activation Pending'}
                     </span>
                     <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                        Reliability: High
                     </span>
                  </div>
              </div>

              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <Mail className="w-3.5 h-3.5" /> Secure Email
                          </p>
                          <p className="text-sm font-bold text-slate-900">{selectedHero.user?.email}</p>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <Activity className="w-3.5 h-3.5" /> Clinical Vitals
                          </p>
                          <p className="text-sm font-bold text-slate-900">Mass: {selectedHero.weightKg}kg</p>
                          <p className="text-sm font-bold text-slate-900">Health: Normal</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Impact Score
                          </p>
                          <p className="text-2xl font-black text-slate-900">{selectedHero.totalDonations || 0} <span className="text-sm font-bold text-slate-400">Total Cycles</span></p>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal Global ID</p>
                          <p className="text-xs font-mono font-bold text-slate-900 break-all">{selectedHero._id}</p>
                       </div>
                    </div>
                 </div>

                 <button onClick={() => setShowInfoModal(false)} className="w-full btn-primary py-5 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600">
                    Seal Intelligence Data
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DonorVerification;
