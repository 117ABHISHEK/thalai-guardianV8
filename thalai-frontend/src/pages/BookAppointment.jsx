import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, Clock, User, MessageSquare, 
  ArrowLeft, CheckCircle, AlertCircle, Sparkles,
  Stethoscope, ShieldCheck
} from 'lucide-react';

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/public/doctors');
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch specialists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      await api.post('/appointments', formData);
      setStatus({ type: 'success', text: 'Appointment cycle initiated successfully.' });
      setTimeout(() => navigate(`/${user.role}-dashboard?tab=appointments`), 2500);
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.message || 'Consultation request failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-16 px-6 lg:px-12 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[100px] -z-10" />

      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black uppercase tracking-widest text-[10px] mb-8 hover:text-sky-500 transition-colors group">
           <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
           {/* Left: Content */}
           <div className="lg:w-1/3 space-y-8 animate-reveal">
              <div>
                 <div className="p-3 bg-sky-500 rounded-2xl w-fit shadow-xl shadow-sky-500/20 mb-6">
                    <Stethoscope className="w-8 h-8 text-white" />
                 </div>
                 <h2 className="text-4xl font-display font-black text-slate-900 tracking-tight leading-tight">Book <br/><span className="text-sky-500 text-gradient">Specialist</span> Consult</h2>
                 <p className="text-slate-500 font-medium mt-4 leading-relaxed">
                    Schedule a synchronized medical consultation with our certified hematologists and clinical specialists.
                 </p>
              </div>

              <div className="space-y-4">
                 {[
                    { icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, text: 'Verified Clinicians' },
                    { icon: <Clock className="w-5 h-5 text-sky-500" />, text: 'Synchronized Scheduling' },
                    { icon: <Sparkles className="w-5 h-5 text-amber-500" />, text: 'Smart AI Pre-analysis' }
                 ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                       <div className="p-2 bg-slate-50 rounded-xl">{item.icon}</div>
                       <span className="font-bold text-slate-700 text-sm">{item.text}</span>
                    </div>
                 ))}
              </div>
           </div>

           {/* Right: Form */}
           <div className="flex-1 animate-reveal" style={{ animationDelay: '0.1s' }}>
              <div className="card-premium bg-white shadow-2xl shadow-slate-200/50 border border-slate-100 p-8 lg:p-12 relative overflow-hidden">
                 {status && (
                   <div className={`mb-8 p-6 rounded-3xl border ${status.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'} flex items-center gap-4 animate-reveal`}>
                      {status.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                      <p className="font-bold text-sm tracking-tight">{status.text}</p>
                   </div>
                 )}

                 <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-2">
                       <label className="input-label">Clinical Specialist</label>
                       <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                          <select
                            name="doctorId"
                            value={formData.doctorId}
                            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                            className="input-field pl-12 cursor-pointer appearance-none bg-white"
                            required
                          >
                            <option value="">Select Practitioner</option>
                            {doctors.map((doc) => (
                              <option key={doc._id || doc.id} value={doc._id || doc.id}>
                                Dr. {doc.name} — ({doc.specialization})
                              </option>
                            ))}
                          </select>
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <label className="input-label">Schedule Date</label>
                          <div className="relative group">
                             <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                             <input
                               type="date"
                               name="date"
                               value={formData.date}
                               min={new Date().toISOString().split('T')[0]}
                               onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                               className="input-field pl-12 bg-white"
                               required
                             />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="input-label">Preferred Time Slot</label>
                          <div className="relative group">
                             <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                             <input
                               type="time"
                               name="time"
                               value={formData.time}
                               onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                               className="input-field pl-12 bg-white"
                               required
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="input-label">Objective / Reason for Consultation</label>
                       <div className="relative group">
                          <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                          <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            rows="4"
                            className="input-field pl-12 pt-4 bg-white resize-none"
                            placeholder="Describe your symptoms or consultation objective..."
                            required
                          ></textarea>
                       </div>
                    </div>

                    <div className="pt-4">
                       <button
                         type="submit"
                         disabled={submitting}
                         className="btn-primary w-full py-5 text-xl shadow-2xl shadow-sky-500/10 group overflow-hidden relative"
                       >
                         <span className="relative z-10 flex items-center justify-center gap-2">
                            {submitting ? 'Initializing Link...' : 'Confirm Consultation Cycle'}
                            {!submitting && <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                         </span>
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
