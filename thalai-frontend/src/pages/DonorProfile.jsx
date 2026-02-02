import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../api/auth';
import HealthMetricsForm from '../components/HealthMetricsForm';
import { getDonorProfile } from '../api/donor';
import { 
  CheckCircle, XCircle, Clock, AlertCircle, 
  ArrowLeft, ShieldCheck, Ruler, Weight, 
  Calendar, Award, Activity, FileText,
  User, Edit3, Heart, Info, Sparkles, Droplets
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DonorProfile = () => {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [donorProfile, setDonorProfile] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHealthMetricsEdit, setShowHealthMetricsEdit] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      setUser(response.data.user);

      if (response.data.user.role === 'donor') {
        try {
          const donorResponse = await getDonorProfile();
          setDonorProfile(donorResponse.data.donor);
          setEligibility(donorResponse.data.eligibility);
        } catch (err) {
          console.error('Donor details missing:', err);
        }
      }
    } catch (err) {
      setError(err.message || 'Identity link interrupted.');
    } finally {
      setLoading(false);
    }
  };

  const getEligibilityStatus = () => {
    if (!eligibility) return { label: 'Pending Assessment', color: 'text-slate-400', bg: 'bg-slate-50', icon: <Clock className="w-5 h-5" /> };
    if (eligibility.eligible) return { label: 'Active Hero', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: <CheckCircle className="w-5 h-5" /> };
    return { label: 'Protocol Deferred', color: 'text-rose-500', bg: 'bg-rose-50', icon: <AlertCircle className="w-5 h-5" /> };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
       <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
    </div>
  );

  const status = getEligibilityStatus();

  return (
    <div className="min-h-screen bg-slate-50/30 py-12 px-6 lg:px-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[100px] -z-10" />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
           <div className="animate-reveal">
              <button 
                onClick={() => navigate('/donor-dashboard')} 
                className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px] mb-4 hover:text-sky-500 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
              </button>
              <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">Hero Registry <span className="text-sky-500 text-gradient">Profile</span></h1>
              <p className="text-slate-500 font-medium">Manage your clinical metrics and biological status.</p>
           </div>

           <div className={`animate-reveal px-6 py-4 rounded-3xl border border-white/50 backdrop-blur-sm shadow-xl flex items-center gap-4 ${status.bg}`}>
              <div className={`p-2 rounded-xl bg-white shadow-sm ${status.color}`}>{status.icon}</div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Biological Status</p>
                 <p className={`font-black text-sm uppercase tracking-tight ${status.color}`}>{status.label}</p>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Primary Bio Card */}
           <div className="lg:col-span-2 space-y-8 animate-reveal" style={{ animationDelay: '0.1s' }}>
              <section className="card-premium h-full">
                 <div className="flex justify-between items-center mb-10 border-b border-slate-100 pb-6">
                    <h2 className="flex items-center gap-2 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400">
                       <Ruler className="w-4 h-4 text-sky-500" /> Bio-Metrics & Physicality
                    </h2>
                    <button 
                      onClick={() => setShowHealthMetricsEdit(!showHealthMetricsEdit)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-sky-600 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                    >
                       <Edit3 className="w-3 h-3" /> {showHealthMetricsEdit ? 'Cancel Refinement' : 'Refine Metrics'}
                    </button>
                 </div>

                 {showHealthMetricsEdit ? (
                    <div className="p-2">
                       <HealthMetricsForm 
                          initialData={donorProfile} 
                          onSave={async (data) => {
                             try { setUpdating(true); await updateProfile(data); await fetchProfile(); setShowHealthMetricsEdit(false); } catch(e){} finally { setUpdating(false); }
                          }}
                          loading={updating}
                       />
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                       {[
                          { label: 'Height', val: `${donorProfile?.heightCm || 'N/A'} cm`, icon: <Ruler className="w-4 h-4" /> },
                          { label: 'Weight', val: `${donorProfile?.weightKg || 'N/A'} kg`, icon: <Weight className="w-4 h-4" /> },
                          { label: 'Blood Hub', val: donorProfile?.bloodGroup || user?.bloodGroup || 'N/A', icon: <Droplets className="w-4 h-4 text-rose-500" /> },
                          { label: 'Cycles', val: donorProfile?.totalDonations || 0, icon: <Activity className="w-4 h-4 text-emerald-500" /> },
                          { label: 'D.O.B', val: formatDate(donorProfile?.dob || user?.dateOfBirth), icon: <Calendar className="w-4 h-4 text-amber-500" /> },
                          { label: 'Frequency', val: `${donorProfile?.donationFrequencyMonths || 3} Mon`, icon: <Clock className="w-4 h-4 text-sky-400" /> },
                          { label: 'Last Log', val: formatDate(donorProfile?.lastDonationDate), icon: <Activity className="w-4 h-4 text-indigo-400" /> },
                          { label: 'Verified', val: donorProfile?.isVerified ? 'Synchronized' : 'Pending', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> }
                       ].map((item, i) => (
                          <div key={i} className="group cursor-default">
                             <div className="flex items-center gap-2 mb-2">
                                <span className="text-slate-300 group-hover:text-sky-500 transition-colors uppercase">{item.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{item.label}</span>
                             </div>
                             <p className="text-xl font-display font-black text-slate-900">{item.val}</p>
                          </div>
                       ))}
                    </div>
                 )}
              </section>

              {/* Medical Events & Reports */}
              <div className="grid md:grid-cols-2 gap-8">
                 <section className="card-premium">
                    <h3 className="flex items-center gap-2 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 mb-6 pb-4 border-b border-slate-100">
                       <FileText className="w-4 h-4 text-indigo-500" /> Clinical Reports
                    </h3>
                    <div className="space-y-4">
                       {donorProfile?.medicalReports?.length > 0 ? (
                          donorProfile.medicalReports.map((report, i) => (
                             <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                   <p className="font-bold text-slate-900">{report.title}</p>
                                   <span className="text-[9px] font-black text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-100">{formatDate(report.reportDate)}</span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-2">{report.notes || 'No terminal observations.'}</p>
                             </div>
                          ))
                       ) : (
                          <div className="text-center py-8">
                             <Activity className="w-12 h-12 text-slate-100 mx-auto mb-2" />
                             <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No clinical reports synced.</p>
                          </div>
                       )}
                    </div>
                 </section>

                 <section className="card-premium">
                    <h3 className="flex items-center gap-2 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 mb-6 pb-4 border-b border-slate-100">
                       <Heart className="w-4 h-4 text-rose-500" /> Condition Log
                    </h3>
                    <div className="space-y-4">
                       {donorProfile?.medicalHistory?.length > 0 ? (
                          donorProfile.medicalHistory.map((entry, i) => (
                             <div key={i} className="p-4 border border-slate-100 rounded-2xl flex items-center gap-4">
                                <div className={`p-2 rounded-xl flex-shrink-0 ${entry.isContraindication ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                   {entry.isContraindication ? <AlertCircle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className="flex justify-between items-center gap-2">
                                      <p className="font-bold text-slate-900 truncate">{entry.condition}</p>
                                      {entry.isContraindication && <span className="text-[8px] font-black uppercase text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded leading-none">Critical</span>}
                                   </div>
                                   <p className="text-[10px] text-slate-400 font-medium">Synced: {formatDate(entry.diagnosisDate)}</p>
                                </div>
                             </div>
                          ))
                       ) : (
                          <div className="text-center py-8">
                             <Activity className="w-12 h-12 text-slate-100 mx-auto mb-2" />
                             <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No conditions registered.</p>
                          </div>
                       )}
                    </div>
                 </section>
              </div>
           </div>

           {/* Hero Integrity Side */}
           <div className="space-y-8 animate-reveal" style={{ animationDelay: '0.2s' }}>
              <section className="card-premium bg-slate-900 border-none relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                    <Droplets className="w-32 h-32 text-sky-400" />
                 </div>
                 <div className="relative z-10 text-white space-y-6">
                    <h3 className="text-2xl font-display font-black leading-tight tracking-tight">Mission Readiness <br/> Protocol</h3>
                    
                    <div className="space-y-4 pt-4 border-t border-white/10">
                       <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
                          <span>Eligibility Pipeline</span>
                          <span className={eligibility?.eligible ? 'text-emerald-400' : 'text-rose-400'}>{eligibility?.eligible ? 'Active' : 'Locked'}</span>
                       </div>
                       <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${eligibility?.eligible ? 'w-full bg-emerald-500' : 'w-1/3 bg-rose-500'}`} />
                       </div>
                    </div>

                    <div className="space-y-4">
                       <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                          "Heroism is not just a gift, it's clinical consistency. Maintain your metrics to remain in the active response pipeline."
                       </p>
                       <button 
                          disabled={!eligibility?.eligible}
                          className="w-full btn-primary py-4 text-lg shadow-xl shadow-sky-500/20 group hover:shadow-sky-500/40"
                       >
                          Initiate Donation <ArrowLeft className="w-5 h-5 ml-2 rotate-180 group-hover:translate-x-1 transition-transform" />
                       </button>
                    </div>
                 </div>
              </section>

              <section className="card-premium h-fit">
                 <h3 className="flex items-center gap-2 font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 mb-6">
                    <Activity className="w-4 h-4 text-emerald-500" /> Active Sync Logs
                 </h3>
                 <div className="space-y-3">
                    {[
                       { label: 'Health Clearance', status: donorProfile?.healthClearance },
                       { label: 'Admin Verification', status: donorProfile?.isVerified },
                       { label: 'Global Availability', status: donorProfile?.availabilityStatus },
                       { label: 'Bio-Sync Active', status: eligibility?.eligible }
                    ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                          <span className="text-xs font-bold text-slate-600 tracking-tight">{item.label}</span>
                          {item.status ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-amber-500 animate-pulse" />}
                       </div>
                    ))}
                 </div>
              </section>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DonorProfile;
