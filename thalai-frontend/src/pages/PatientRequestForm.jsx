import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createRequest, getUserRequests } from '../api/requests';
import { 
  AlertTriangle, Droplets, MapPin, Hospital, 
  User, Phone, FileText, Send, CheckCircle2,
  Clock, ArrowRight, Zap, Info
} from 'lucide-react';

const PatientRequestForm = ({ onRequestCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    bloodGroup: user?.bloodGroup || '',
    unitsRequired: 1,
    urgency: 'medium',
    hospital: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    contactName: '',
    contactPhone: '',
    contactRelationship: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);

  useEffect(() => {
    checkActiveRequests();
  }, []);

  const checkActiveRequests = async () => {
    try {
      const response = await getUserRequests(user._id || user.id);
      const active = response.data.requests?.find(req => req.status === 'pending' || req.status === 'searching');
      if (active) {
        setHasActiveRequest(true);
        setActiveRequest(active);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    // Sanitization
    if (['city', 'state', 'contactName'].includes(name)) {
      value = value.replace(/[^a-zA-Z\s-]/g, '');
    }
    if (name === 'zipCode') {
      value = value.replace(/\D/g, '').slice(0, 6);
    }
    if (name === 'contactPhone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    if (name === 'unitsRequired') {
      if (parseFloat(value) < 0) value = 0;
      if (parseFloat(value) > 10) value = 10;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    if (formData.contactPhone.length !== 10) {
      setMessage('Contact phone must be exactly 10 digits');
      return false;
    }
    const fraudPatterns = [
      '1234567890', '0123456789', '9876543210', '0000000000',
      '1111111111', '2222222222', '3333333333', '4444444444', 
      '5555555555', '6666666666', '7777777777', '8888888888', '9999999999'
    ];
    if (fraudPatterns.includes(formData.contactPhone)) {
      setMessage('Please enter a valid, verifiable emergency contact number');
      return false;
    }
    if (!formData.bloodGroup || !formData.hospital || !formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.contactName) {
        setMessage('Please fill all required operational fields');
        return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const requestData = {
        bloodGroup: formData.bloodGroup,
        unitsRequired: parseFloat(formData.unitsRequired),
        urgency: formData.urgency,
        location: { hospital: formData.hospital, address: formData.address, city: formData.city, state: formData.state, zipCode: formData.zipCode },
        contactPerson: { name: formData.contactName, phone: formData.contactPhone, relationship: formData.contactRelationship },
        notes: formData.notes,
      };

      await createRequest(requestData);
      setMessage('Vital request broadcast successful!');
      if (onRequestCreated) onRequestCreated();
      await checkActiveRequests();
    } catch (error) {
      setMessage(error.message || 'Transmission failed. Verify link.');
    } finally {
      setLoading(false);
    }
  };

  if (hasActiveRequest) {
    return (
      <div className="animate-reveal">
        <div className="p-10 rounded-[40px] bg-slate-900 text-white relative overflow-hidden shadow-2xl">
           <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Zap className="w-48 h-48 text-sky-400" />
           </div>
           
           <div className="relative z-10 max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20">
                    <AlertTriangle className="w-6 h-6 text-white" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Active Pipeline Found</span>
              </div>
              
              <h3 className="text-4xl font-display font-black mb-4 tracking-tight">Requirement <span className="text-sky-400">In Progress</span></h3>
              <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10">
                You already have an active request being processed by our neural network. Please finalize or cancel it before initiating a new cycle.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-white/5 border border-white/10 rounded-[32px] mb-8">
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Status</p>
                    <p className="font-bold text-sky-400 uppercase tracking-widest">{activeRequest.status}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Requirement</p>
                    <p className="font-bold">{activeRequest.bloodGroup}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Units</p>
                    <p className="font-bold text-rose-400">{activeRequest.unitsRequired}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Logged</p>
                    <p className="font-bold">{new Date(activeRequest.createdAt).toLocaleDateString()}</p>
                 </div>
              </div>

              <button onClick={() => onRequestCreated && onRequestCreated()} className="btn-primary py-4 px-10 group">
                 View Tracking History <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
           </div>
        </div>
      </div>
    );
  }

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="container-custom max-w-4xl mx-auto animate-reveal py-8 md:py-12">
      <div className="mb-10">
         <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-100">
               Urgent Acquisition
            </span>
         </div>
         <h2 className="text-4xl font-display font-black tracking-tight text-slate-900">Initiate <span className="text-sky-500">Care Link</span></h2>
         <p className="text-slate-500 font-medium mt-2">Configure and broadcast a new blood requirement across the guardian network.</p>
      </div>

      {message && (
        <div className={`p-6 rounded-[32px] mb-10 border ${message.includes('success') ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'} flex items-center gap-4`}>
           {message.includes('success') ? <CheckCircle2 className="w-6 h-6" /> : <Info className="w-6 h-6" />}
           <span className="font-bold text-sm">{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
         {/* Vital Configuration */}
         <section className="card-premium p-6 md:p-8">
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-slate-100 pb-4">
               <Droplets className="w-4 h-4 text-rose-500" /> Vital Configuration
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
               <div className="space-y-2">
                  <label className="input-label">Blood Requirement</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="input-field" required>
                     <option value="">Select Group</option>
                     {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
               </div>
                <div className="space-y-2">
                  <label className="input-label">Units Required</label>
                  <input 
                    type="number" 
                    name="unitsRequired" 
                    value={formData.unitsRequired} 
                    onChange={handleChange} 
                    className={`input-field ${formData.unitsRequired > 3 ? 'border-amber-400 bg-amber-50' : ''}`} 
                    min="0.5" 
                    max="6" 
                    step="0.5"
                    required 
                  />
                  <p className="text-[10px] text-rose-500 font-bold mt-1">Hard: 0.5-6 | Alert: &gt;3 units</p>
               </div>
               <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <label className="input-label">Urgency Priority</label>
                  <select name="urgency" value={formData.urgency} onChange={handleChange} className="input-field font-black uppercase text-[10px] tracking-widest" required>
                     <option value="low">Low Priority</option>
                     <option value="medium">Standard Operational</option>
                     <option value="high">High Urgency</option>
                     <option value="critical">Critical (Immediate)</option>
                  </select>
               </div>
            </div>
         </section>

         {/* Medical Logistics */}
         <section className="card-premium p-6 md:p-8">
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-slate-100 pb-4">
               <MapPin className="w-4 h-4 text-sky-500" /> Clinical Logistics
            </h4>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="input-label">Target Medical Center (Hospital)</label>
                  <div className="relative group">
                     <Hospital className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                     <input type="text" name="hospital" value={formData.hospital} onChange={handleChange} className="input-field pl-12" placeholder="Central City Medical" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="input-label">Street Address / Ward / Room</label>
                  <div className="relative group">
                     <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                     <input type="text" name="address" value={formData.address} onChange={handleChange} className="input-field pl-12" placeholder="123 Care St / Block B" />
                  </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1"><label className="input-label text-[10px]">City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className="input-field py-2.5" /></div>
                  <div className="space-y-1"><label className="input-label text-[10px]">State/Region</label><input type="text" name="state" value={formData.state} onChange={handleChange} className="input-field py-2.5" /></div>
                  <div className="space-y-1"><label className="input-label text-[10px]">Postal Code</label><input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="input-field py-2.5" /></div>
               </div>
            </div>
         </section>

         {/* Protocol Contact */}
         <section className="card-premium p-6 md:p-8">
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 border-b border-slate-100 pb-4">
               <User className="w-4 h-4 text-emerald-500" /> Operational Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="input-label">On-site Contact</label>
                  <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} className="input-field" placeholder="Full Name" />
               </div>
               <div className="space-y-2">
                  <label className="input-label">Emergency Phone</label>
                  <div className="relative group">
                     <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                     <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="input-field pl-12" placeholder="+123..." />
                  </div>
               </div>
            </div>
         </section>

         {/* Additional Synthesis */}
         <section className="card-premium p-6 md:p-8">
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
               <FileText className="w-4 h-4 text-indigo-500" /> Supplementary Case Notes
            </h4>
            <textarea name="notes" value={formData.notes} onChange={handleChange} className="input-field min-h-[150px] resize-none" placeholder="Any specific requirements or instructions for the matched hero..." maxLength="500"></textarea>
            <div className="flex justify-end mt-2"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formData.notes.length}/500 Context Units</span></div>
         </section>

         <button type="submit" disabled={loading} className="w-full btn-primary py-5 text-xl shadow-2xl shadow-sky-500/20 group">
            {loading ? 'Transmitting Vital Request...' : 'Initialize Vital Broadcast'} <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
         </button>
      </form>
    </div>
  );
};

export default PatientRequestForm;
