import { useState, useEffect } from 'react';
import { getTopMatches } from '../api/match';
import { markDonorUnavailable } from '../api/requests';
import { Search, X, User, MapPin, Phone, ShieldCheck, Zap, Activity, Heart, Target, AlertCircle } from 'lucide-react';

import { createPortal } from 'react-dom';

const RequestMatchesModal = ({ requestId, onClose }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchMatches();
  }, [requestId]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await getTopMatches(requestId);
      setMatches(data.data.matches || []);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkUnavailable = async (donorId) => {
    if (!window.confirm('Are you sure this donor is unavailable? We will notify the next backup donor immediately.')) return;
    
    try {
      setUpdatingId(donorId);
      await markDonorUnavailable(requestId, donorId);
      await fetchMatches(); // Refresh the list
    } catch (error) {
      alert(error.message || 'Failed to update donor status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (score >= 60) return 'text-sky-500 bg-sky-50 border-sky-100';
    return 'text-amber-500 bg-amber-50 border-amber-100';
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up border border-white/20">
        {/* Header */}
        <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 flex-shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="px-3 py-1 bg-sky-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-sky-500/20">
                 Precision Engine
               </span>
            </div>
            <h2 className="text-4xl font-display font-black text-slate-900 tracking-tight">System <span className="text-sky-500">Matches</span></h2>
            <p className="text-sm font-bold text-slate-500 mt-2 flex items-center gap-2">
               <Search className="w-4 h-4 text-sky-400" /> Neural scan found {matches.length} active hero profiles
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-4 bg-white hover:bg-rose-50 hover:text-rose-500 rounded-3xl transition-all shadow-sm border border-slate-100 text-slate-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 pb-20 bg-white no-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
               <div className="w-16 h-16 border-4 border-sky-500/10 border-t-sky-500 rounded-full animate-spin mb-6" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Running Neural Optimization...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-24 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
              <Target className="w-20 h-20 text-slate-200 mx-auto mb-6" />
              <h3 className="text-2xl font-display font-black text-slate-900 mb-2">Zero Alignment Detected</h3>
              <p className="text-slate-500 font-medium max-w-sm mx-auto">
                No active donors currently match the clinical requirement profile. Background monitoring remains active.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {matches.map((match) => (
                  <div key={match.matchId} className="card-premium group hover:shadow-2xl hover:shadow-slate-200/50 transition-all border border-slate-100 bg-white/50 backdrop-blur-sm p-6 overflow-hidden relative">
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-xl shadow-slate-900/10">
                              {match.donor?.bloodGroup}
                           </div>
                           <div>
                              <h4 className="text-lg font-display font-black text-slate-900 mb-1">{match.donor?.name || 'Anonymous Hero'}</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
                                 <MapPin className="w-3.5 h-3.5 text-sky-400" /> {match.donor?.address?.city || 'Region Active'}
                              </p>
                           </div>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl border text-[11px] font-black flex flex-col items-center leading-none ${getScoreColor(match.matchScore)}`}>
                           <span className="mb-0.5">{match.matchScore}%</span>
                           <span className="text-[7px] uppercase tracking-widest opacity-60">Sync</span>
                        </div>
                     </div>

                     <div className="space-y-4 mb-8">
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-sky-500 transition-all duration-1000" style={{ width: `${match.matchScore}%` }} />
                        </div>
                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 px-1">
                           <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> High Reliability</span>
                           <span className={`flex items-center gap-1 ${match.status === 'accepted' ? 'text-emerald-500' : 'text-amber-500'}`}>
                              <ShieldCheck className="w-3 h-3" /> {match.status}
                           </span>
                        </div>
                     </div>

                     <div className="pt-6 border-t border-slate-50 flex gap-3">
                        {match.status === 'accepted' ? (
                          <>
                            <a 
                              href={`tel:${match.donor?.phone}`}
                              className="flex-[2] btn-primary py-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 flex items-center justify-center gap-2 group/btn"
                            >
                              <Phone className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" /> Contact Hero
                            </a>
                            <button
                              onClick={() => handleMarkUnavailable(match.donorId)}
                              disabled={updatingId === match.donorId}
                              title="Mark as Unavailable (Promote Backup)"
                              className="flex-1 px-4 py-4 bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black tracking-widest uppercase disabled:opacity-50"
                            >
                              {updatingId === match.donorId ? <Activity className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
                              Drop
                            </button>
                          </>
                        ) : match.status === 'unavailable' ? (
                          <div className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2">
                             <AlertCircle className="w-4 h-4 text-rose-400" /> Marked Unavailable
                          </div>
                        ) : (
                          <div className="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2">
                             <Activity className="w-4 h-4 animate-pulse text-sky-400" /> Awaiting Initial Link
                          </div>
                        )}
                        <button className="p-4 bg-white border border-slate-100 text-slate-300 hover:text-sky-500 transition-all rounded-2xl">
                           <User className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
               ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="btn-primary px-12 py-4 shadow-xl shadow-sky-500/10"
          >
            Acknowledge Intelligence
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RequestMatchesModal;
