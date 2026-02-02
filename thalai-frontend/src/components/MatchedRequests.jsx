import { useState, useEffect } from 'react';
import { getMyMatches, updateMatchStatus } from '../api/donor';
import { Search, Heart, MapPin, Calendar, Clock, Droplets, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';

const MatchedRequests = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await getMyMatches();
      setMatches(data.data.matches);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      setMessage('Failed to load matched requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (matchId, status) => {
    try {
      setUpdating(matchId);
      await updateMatchStatus(matchId, { status });
      setMessage(`Match ${status} successfully!`);
      fetchMatches();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(`Failed to ${status} match:`, error);
      setMessage(`Failed to ${status} match`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {message && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border animate-reveal ${
          message.includes('Failed') ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
        }`}>
          <div className={`p-1 rounded-full ${message.includes('Failed') ? 'bg-rose-100' : 'bg-emerald-100'}`}>
            {message.includes('Failed') ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </div>
          <span className="text-sm font-bold">{message}</span>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-6 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200 animate-reveal">
          <div className="p-6 bg-white rounded-3xl shadow-xl shadow-slate-200/50 mb-6">
            <Search className="w-12 h-12 text-slate-300" />
          </div>
          <h3 className="text-2xl font-display font-black text-slate-900 mb-2">No Active Matches</h3>
          <p className="text-slate-500 text-center max-w-sm font-medium">
            When a patient's request matches your profile and location, it will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="grid gap-8">
          {matches.map((match, idx) => (
            <div 
              key={match.matchId} 
              className="group relative bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 animate-reveal"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* URGENCY BADGE */}
              <div className="absolute -top-3 left-8">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg ${
                  match.request?.urgency === 'critical' ? 'bg-rose-500 text-white shadow-rose-200' : 
                  match.request?.urgency === 'high' ? 'bg-orange-500 text-white shadow-orange-200' : 
                  'bg-sky-500 text-white shadow-sky-200'
                }`}>
                  <ShieldAlert className="w-3 h-3" />
                   {match.request?.urgency} PRIORITY
                </div>
              </div>

              <div className="flex flex-col xl:flex-row gap-8">
                {/* LEFT: PATIENT INFO */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-display font-black text-slate-900">
                          {match.request?.patientId?.name || 'Urgent Case'}
                        </h2>
                        <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[11px] font-black uppercase tracking-wider border border-sky-100">
                          Match: {match.matchScore}%
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-500 text-sm font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {match.request?.location?.city || 'City'}, {match.request?.location?.state || 'State'}
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {new Date(match.request?.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {match.request?.reason && (
                    <div className="p-4 bg-slate-50 rounded-2xl italic text-slate-600 text-sm relative">
                      <span className="absolute -top-2 -left-2 text-4xl text-slate-200 font-serif leading-none opacity-50 block h-full">"</span>
                      {match.request.reason}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                     {[
                       { label: 'BLOOD GROUP', value: match.request?.bloodGroup, icon: <Droplets className="w-4 h-4 text-rose-500" />, bg: 'bg-rose-50' },
                       { label: 'UNITS NEEDED', value: match.request?.unitsRequired, icon: <ShieldAlert className="w-4 h-4 text-amber-500" />, bg: 'bg-amber-50' },
                       { label: 'STATUS', value: match.status, icon: <Clock className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-50' },
                       { label: 'MATCHED ON', value: new Date(match.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), icon: <Calendar className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-50' }
                     ].map((stat, i) => (
                       <div key={i} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm group-hover:border-slate-200 transition-colors">
                          <div className="flex items-center gap-2 mb-1.5">
                             <div className={`p-1.5 rounded-lg ${stat.bg}`}>{stat.icon}</div>
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                          </div>
                          <p className="text-sm font-black text-slate-900 px-1">{stat.value}</p>
                       </div>
                     ))}
                  </div>
                </div>

                {/* RIGHT: ACTIONS */}
                <div className="xl:w-64 flex flex-col justify-center gap-3">
                   {match.status === 'pending' ? (
                     <>
                        <button
                          onClick={() => handleStatusUpdate(match.matchId, 'accepted')}
                          disabled={updating === match.matchId}
                          className="btn-primary w-full py-4 text-sm font-black group/btn"
                        >
                          {updating === match.matchId ? 'Processing...' : (
                            <>
                              Accept Request <Heart className="w-4 h-4 group-hover/btn:fill-white transition-all" />
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(match.matchId, 'rejected')}
                          disabled={updating === match.matchId}
                          className="w-full py-4 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-2xl font-black text-sm transition-all border border-transparent hover:border-rose-100"
                        >
                          Decline Case
                        </button>
                     </>
                   ) : match.status === 'accepted' ? (
                     <div className="h-full flex flex-col items-center justify-center p-6 bg-emerald-50 rounded-[28px] border border-emerald-100 text-center space-y-3">
                        <div className="p-4 bg-white rounded-2xl shadow-lg shadow-emerald-200/50">
                           <Heart className="w-10 h-10 text-rose-500 fill-rose-500 animate-pulse" />
                        </div>
                        <div>
                           <p className="text-emerald-800 font-black text-lg">Heros Accepted!</p>
                           <p className="text-emerald-600/70 text-[11px] font-bold leading-relaxed px-2">Patient circle has been notified. They will reach out soon.</p>
                        </div>
                     </div>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[28px] border border-slate-200 text-center grayscale opacity-60">
                         <XCircle className="w-10 h-10 text-slate-400 mb-2" />
                         <p className="text-slate-500 font-black text-sm">Request Deferred</p>
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchedRequests;
