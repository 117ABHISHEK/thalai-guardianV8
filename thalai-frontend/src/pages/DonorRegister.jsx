import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { 
  Droplets, User, Mail, Lock, Phone, MapPin, 
  Calendar, Heart, Ruler, Weight, Activity, 
  Plus, Trash2, ArrowRight, ShieldCheck, Sparkles,
  Stethoscope, Info
} from 'lucide-react';

const DonorRegister = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  
  const preFillData = location.state?.formData || {};
  
  const [formData, setFormData] = useState({
    name: preFillData.name || '',
    email: preFillData.email || '',
    password: preFillData.password || '',
    confirmPassword: preFillData.confirmPassword || '',
    role: 'donor',
    bloodGroup: preFillData.bloodGroup || '',
    phone: preFillData.phone || '',
    street: preFillData.street || '',
    city: preFillData.city || '',
    state: preFillData.state || '',
    zipCode: preFillData.zipCode || '',
    dob: preFillData.dateOfBirth || preFillData.dob || '',
    heightCm: '',
    weightKg: '',
    donationFrequencyMonths: '3',
    lastDonationDate: '',
    medicalHistory: [{ condition: '', details: '', diagnosisDate: '', isContraindication: false }],
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [nextPossibleDate, setNextPossibleDate] = useState(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Identity is required';
    if (!formData.email) newErrors.email = 'Secure email is required';
    if (!formData.password) newErrors.password = 'Security key is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Keys do not match';
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Biological type is required';

    if (!formData.dob) {
      newErrors.dob = 'Chronological age verification required';
    } else {
      const age = calculateAge(formData.dob);
      if (age < 18) newErrors.dob = 'Minimum functional age of 18 required for heroes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Sanitization
    switch (name) {
      case 'heightCm':
      case 'weightKg':
      case 'donationFrequencyMonths':
         value = value.replace(/\D/g, '');
         break;
      default:
         break;
    }

    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const handleMedicalHistoryChange = (index, field, value) => {
    const newHistory = [...formData.medicalHistory];
    newHistory[index] = { ...newHistory[index], [field]: field === 'isContraindication' ? value === 'true' : value };
    setFormData({ ...formData, medicalHistory: newHistory });
  };

  const addMedicalHistoryEntry = () => {
    setFormData({ ...formData, medicalHistory: [...formData.medicalHistory, { condition: '', details: '', diagnosisDate: '', isContraindication: false }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const userData = {
        name: formData.name, email: formData.email, password: formData.password, role: 'donor', bloodGroup: formData.bloodGroup,
        phone: formData.phone || undefined, address: { street: formData.street, city: formData.city, state: formData.state, zipCode: formData.zipCode },
        dob: formData.dob, heightCm: parseFloat(formData.heightCm), weightKg: parseFloat(formData.weightKg),
        donationFrequencyMonths: parseInt(formData.donationFrequencyMonths), lastDonationDate: formData.lastDonationDate || undefined,
        medicalHistory: formData.medicalHistory.filter(h => h.condition.trim() !== '')
      };
      await register(userData);
      await login({ email: formData.email, password: formData.password });
      navigate('/donor-dashboard');
    } catch (err) {
      setErrors({ submit: err.message || 'Transmission failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex overflow-hidden font-body animate-slide-up">
      {/* Narrative Side */}
      <div className="hidden lg:flex lg:w-1/3 relative bg-slate-900 flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500 rounded-full blur-[100px]" />
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10 space-y-8 animate-reveal">
           <Link to="/" className="flex items-center gap-3">
              <div className="p-3 bg-sky-500 rounded-2xl shadow-lg shadow-sky-500/20">
                 <Droplets className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-display font-black text-white tracking-tight">ThalAI <span className="text-sky-400">Hero</span></h1>
           </Link>
           
           <div className="space-y-6">
              <h2 className="text-5xl font-display font-black text-white leading-[1.1] tracking-tight">
                Refine your <br/> <span className="text-gradient">Biological Profile</span>
              </h2>
              <p className="text-slate-400 font-medium text-lg leading-relaxed">
                As a donor, your health data powers our precision matching engine. High-fidelity profiles ensure faster, safer life-saving connections.
              </p>
           </div>

           <div className="grid grid-cols-1 gap-4 pt-8">
              {[
                { icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, title: 'Bio-Privacy', desc: 'Encrypted medical vault' },
                { icon: <Activity className="w-5 h-5 text-sky-400" />, title: 'Sync Integrity', desc: 'Real-time blood analysis' },
                { icon: <Sparkles className="w-5 h-5 text-amber-500" />, title: 'Hero Perks', desc: 'Priority community status' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl">
                   <div className="p-2 bg-white/5 rounded-xl">{item.icon}</div>
                   <div>
                      <p className="font-bold text-white text-sm">{item.title}</p>
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        <div className="relative z-10 pt-12 border-t border-white/10 text-slate-500 text-xs font-black uppercase tracking-widest">
           Secure Protocol V8.2 // Guardian Network
        </div>
      </div>

      {/* Profile Engineering Side */}
      <div className="w-full lg:w-2/3 bg-slate-50/50 relative overflow-y-auto no-scrollbar pb-20">
         <div className="max-w-3xl mx-auto px-6 lg:px-12 pt-16">
            <div className="mb-10 animate-reveal">
               <h3 className="text-3xl font-display font-black text-slate-900 mb-2">Configure Hero Profile</h3>
               <p className="text-slate-500 font-medium">Step 2: Biological & Medical Configuration</p>
            </div>

            {errors.submit && (
              <div className="mb-8 p-4 bg-rose-50 border border-border-rose-100 rounded-3xl text-rose-600 flex items-center gap-3 animate-reveal">
                 <Info className="w-5 h-5" />
                 <span className="font-bold text-sm">{errors.submit}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12 animate-reveal" style={{ animationDelay: '0.1s' }}>
               {/* Biological Context */}
               <section className="card-premium p-6 md:p-8">
                  <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 border-b border-slate-100 pb-4">
                     <Heart className="w-4 h-4 text-rose-500" /> Biological Context
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                     <div className="space-y-2">
                        <label className="input-label">Chronological Identity (DOB)</label>
                        <div className="relative group">
                           <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                           <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="input-field pl-12" required />
                        </div>
                        {errors.dob && <p className="text-xs text-rose-500 font-bold px-2">{errors.dob}</p>}
                     </div>

                     <div className="space-y-2">
                        <label className="input-label">Blood Metric (Type)</label>
                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="input-field cursor-pointer" required>
                           <option value="">Select Type</option>
                           {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                        </select>
                     </div>

                     <div className="space-y-2">
                        <label className="input-label">Vertical Metric (Height CM)</label>
                        <div className="relative group">
                           <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                           <input 
                              type="number" 
                              name="heightCm" 
                              value={formData.heightCm} 
                              onChange={handleChange} 
                              className={`input-field pl-12 ${formData.heightCm && (formData.heightCm < 60 || formData.heightCm > 210) ? 'border-amber-400 bg-amber-50' : ''}`} 
                              placeholder="175"
                              min="45"
                              max="230"
                           />
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold px-2">Hard: 45-230 | Soft: 60-210 cm</p>
                     </div>

                     <div className="space-y-2">
                        <label className="input-label">Mass Metric (Weight KG)</label>
                        <div className="relative group">
                           <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                           <input 
                              type="number" 
                              name="weightKg" 
                              value={formData.weightKg} 
                              onChange={handleChange} 
                              className={`input-field pl-12 ${formData.weightKg && (formData.weightKg < 10 || formData.weightKg > 200) ? 'border-amber-400 bg-amber-50' : ''}`} 
                              placeholder="70"
                              min="2"
                              max="250"
                           />
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold px-2">Hard: 2-250 | Alert: &lt;10 or &gt;200 kg</p>
                     </div>
                  </div>
               </section>

               {/* Donation History */}
               <section className="card-premium p-6 md:p-8">
                  <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 border-b border-slate-100 pb-4">
                     <Activity className="w-4 h-4 text-sky-500" /> Donation Cycle
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                     <div className="space-y-2">
                        <label className="input-label">Last Successful Cycle</label>
                        <input type="date" name="lastDonationDate" value={formData.lastDonationDate} onChange={handleChange} className="input-field" />
                     </div>
                     <div className="space-y-2">
                        <label className="input-label">Desired Frequency (Months)</label>
                        <input type="number" name="donationFrequencyMonths" value={formData.donationFrequencyMonths} onChange={handleChange} className="input-field" min="3" />
                     </div>
                  </div>
               </section>

               {/* Medical Registry */}
               <section className="card-premium p-6 md:p-8">
                  <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                    <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                       <Stethoscope className="w-4 h-4 text-emerald-500" /> Medical Registry
                    </h4>
                    <button type="button" onClick={addMedicalHistoryEntry} className="text-sky-600 font-bold text-xs flex items-center gap-1 hover:text-sky-700">
                       <Plus className="w-4 h-4" /> Add Record
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                     {formData.medicalHistory.map((entry, idx) => (
                        <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-[32px] relative group/row">
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                 <label className="input-label text-[10px]">Condition</label>
                                 <input type="text" placeholder="e.g. Hypertension" value={entry.condition} onChange={(e) => handleMedicalHistoryChange(idx, 'condition', e.target.value)} className="input-field bg-white" />
                              </div>
                              <div className="space-y-1">
                                 <label className="input-label text-[10px]">Diagnosis Date</label>
                                 <input type="date" value={entry.diagnosisDate} onChange={(e) => handleMedicalHistoryChange(idx, 'diagnosisDate', e.target.value)} className="input-field bg-white" />
                              </div>
                              <div className="sm:col-span-2 space-y-1">
                                 <label className="input-label text-[10px]">Observations</label>
                                 <textarea placeholder="Observation details..." value={entry.details} onChange={(e) => handleMedicalHistoryChange(idx, 'details', e.target.value)} className="input-field bg-white" rows="2" />
                              </div>
                           </div>
                           <button type="button" onClick={() => setFormData({...formData, medicalHistory: formData.medicalHistory.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-xl shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-110">
                              <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                     ))}
                   </div>
                </section>

               {/* Operational Actions */}
               <div className="flex flex-col sm:flex-row gap-4 pt-10">
                  <button type="button" onClick={() => navigate(-1)} className="btn-secondary py-5 px-12">
                     Revise Identity
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 py-5 text-lg shadow-2xl shadow-sky-500/20">
                     {loading ? 'Initializing Core...' : 'Activate Hero Status'} <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
               </div>
            </form>
         </div>
      </div>
    </div>
  );
};

export default DonorRegister;
