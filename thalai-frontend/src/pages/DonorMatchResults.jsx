import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/auth';
import { 
  RefreshCw, Phone, Handshake, ArrowLeft, 
  Target, Zap, Activity, ShieldCheck, 
  MapPin, User, ChevronRight, Droplets,
  Search, Info, Sparkles, MessageCircle
} from 'lucide-react';

const DonorMatchResults = () => {
  const { requestId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (requestId) findMatches();
  }, [requestId]);

  const findMatches = async () => {
    try {
      setLoading(true);
      const response = await api.post('/match/find', { requestId });
      setMatches(response.data.data.matches || []);
      setRequest(response.data.data.request);
    } catch (err) {
      setError(err.response?.data?.message || 'Neural search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (donorId) => {
    try {
      await api.post('/connections/request', { targetUserId: donorId, notes: 'Initiated through precision match results.' });
      alert('Neural link request broadcasted to the donor.');
    } catch (err) {
      alert(err.response?.data?.message || 'Link failed.');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (score >= 60) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-rose-500 bg-rose-50 border-rose-100';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
       <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-sky-500/10 border-t-sky-500 rounded-full animate-spin mb-6" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Running Neural Optimization...</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-16 px-6 lg:px-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-12 animate-reveal">
           <div>
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px] mb-4 hover:text-sky-500 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to History
              </button>
              <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight leading-none mb-4 flex items-center gap-3">
                 <Target className="w-10 h-10 text-sky-500" /> Neural Match <span className="text-sky-500">Results</span>
              </h1>
              <p className="text-slate-500 font-medium">Precision alignment based on location, availability, and AI prediction score.</p>
           </div>
           
           <button onClick={findMatches} className="p-4 bg-white border border-slate-200 rounded-3xl shadow-sm hover:border-sky-200 hover:text-sky-500 transition-all active:scale-95 group">
              <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
           </button>
        </div>

        {error && (
          <div className="p-6 bg-rose-50 border border-rose-100 rounded-[32px] text-rose-600 font-black text-xs uppercase tracking-widest mb-10 animate-reveal flex items-center gap-3">
             <Info className="w-5 h-5" /> {error}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
           {/* Request Summary Side */}
           <div className="lg:col-span-1 space-y-6 animate-reveal" style={{ animationDelay: '0.1s' }}>
              <section className="card-premium bg-slate-900 border-none relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Droplets className="w-24 h-24 text-sky-400" />
                 </div>
                 <div className="relative z-10 text-white">
                    <h3 className="text-xl font-display font-black mb-6 border-b border-white/10 pb-4">Target Requirement</h3>
                    <div className="space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl font-black">{request?.bloodGroup}</div>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Biological Core</p>
                             <p className="font-bold">{request?.unitsRequired} Units Required</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${request?.urgency === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/10 text-slate-300'}`}>
                             <Zap className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Priority Scale</p>
                             <p className="font-bold uppercase tracking-tight">{request?.urgency} Protocol</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </section>

              <div className="card-premium p-6 italic text-[11px] text-slate-400 font-medium leading-relaxed">
                 <Search className="w-4 h-4 mb-2 text-sky-300" />
                 "Our AI considers historical reliability and real-time location to present the most viable heroes first."
              </div>
           </div>

           {/* Matches Grid */}
           <div className="lg:col-span-3 space-y-6 animate-reveal" style={{ animationDelay: '0.2s' }}>
              {matches.length === 0 ? (
                 <div className="py-24 text-center card-premium bg-white border-dashed border-2">
                    <Activity className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                    <h3 className="text-xl font-display font-black text-slate-900 mb-2">Zero Alignment Detected</h3>
                    <p className="text-slate-500 font-medium px-12">No matching donors are currently active in your synchronization region. The network will continue background search automatically.</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 gap-6">
                    {matches.map((match, idx) => (
                       <div key={idx} className="card-premium group hover:shadow-2xl hover:shadow-slate-200/50 transition-all border border-white overflow-hidden bg-white/80 backdrop-blur-sm">
                          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                             {/* Score Wheel (Mobile Friendly Square) */}
                             <div className={`w-24 h-24 rounded-[32px] border-2 flex flex-col items-center justify-center flex-shrink-0 ${getScoreColor(match.matchScore)}`}>
                                <span className="text-2xl font-display font-black">{match.matchScore}%</span>
                                <span className="text-[8px] font-black uppercase tracking-widest text-inherit opacity-70">Alignment</span>
                             </div>

                             {/* Profile Core */}
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                   <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center font-black text-sm text-slate-600">{match.bloodGroup}</div>
                                   <h3 className="text-2xl font-display font-black text-slate-900 truncate">
                                      {match.name || `Hero-X${idx}`}
                                   </h3>
                                   <span className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[9px] font-black uppercase tracking-widest">
                                      <ShieldCheck className="w-3 h-3" /> Verified
                                   </span>
                                </div>
                                <div className="flex flex-wrap gap-4 text-slate-500 text-xs font-bold">
                                   <div className="flex items-center gap-1.5 hover:text-sky-500 transition-colors cursor-pointer">
                                      <MapPin className="w-3.5 h-3.5" /> 2.4 KM Distance
                                   </div>
                                   <div className="flex items-center gap-1.5 hover:text-sky-500 transition-colors cursor-pointer">
                                      <User className="w-3.5 h-3.5" /> {match.email}
                                   </div>
                                </div>
                             </div>

                             {/* Breakdown Component */}
                             <div className="grid grid-cols-2 gap-x-8 gap-y-2 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 w-full md:w-auto min-w-[200px]">
                                {[
                                   { label: 'LOC', val: match.scoreBreakdown.locationScore },
                                   { label: 'AVA', val: match.scoreBreakdown.availabilityScore },
                                   { label: 'FRQ', val: match.scoreBreakdown.donationFrequencyScore },
                                   { label: 'PRD', val: match.scoreBreakdown.aiPredictionScore }
                                ].map((stat, i) => (
                                   <div key={i} className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                                      <span>{stat.label}</span>
                                      <span className="text-slate-900 font-display">{stat.val}%</span>
                                   </div>
                                ))}
                             </div>
                          </div>

                          {/* Quick Secondary Actions */}
                          <div className="mt-8 pt-8 border-t border-slate-100 flex gap-4">
                             <button 
                               onClick={() => match.phone && (window.location.href = `tel:${match.phone}`)}
                               className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-sky-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 active:scale-95 group"
                             >
                                <Phone className="w-4 h-4 group-hover:rotate-12 transition-transform" /> 
                                Immediate Protocol
                             </button>
                             <button 
                               onClick={() => handleConnect(match.userId)}
                               className="px-6 py-4 bg-white border border-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-sky-500 hover:text-sky-500 transition-all active:scale-95 flex items-center gap-2 group shadow-sm"
                             >
                                <Handshake className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                                Request Sync
                             </button>
                             <button className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-sky-50 hover:text-sky-600 transition-all">
                                <MessageCircle className="w-5 h-5" />
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default DonorMatchResults;
