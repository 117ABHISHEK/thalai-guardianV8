import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { 
  Droplets, Check, User, Mail, Lock, Phone, 
  MapPin, Calendar, Briefcase, Award, ArrowRight,
  Stethoscope, Heart, UserPlus
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    bloodGroup: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    dateOfBirth: '',
    licenseNumber: '',
    specialization: 'Hematology',
    qualification: '',
    experience: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('right');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setDirection('right');
      setStep(2);
    }
  };

  const handleBack = () => {
    setDirection('left');
    setStep(1);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.role || !formData.bloodGroup) {
      setError('Please fill all required fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!validateStep1()) {
      setStep(1);
      return;
    }

    if (formData.role === 'donor') {
      navigate('/register/donor', { state: { formData } });
      return;
    }

    if (formData.role === 'doctor') {
      if (!formData.licenseNumber || !formData.specialization || !formData.qualification) {
        setError('License number, specialization, and qualification are required for doctors');
        return;
      }
    }

    setLoading(true);

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone || undefined,
        address: {
          street: formData.street || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
        },
        dateOfBirth: formData.dateOfBirth || undefined,
        licenseNumber: formData.role === 'doctor' ? formData.licenseNumber : undefined,
        specialization: formData.role === 'doctor' ? formData.specialization : undefined,
        qualification: formData.role === 'doctor' ? formData.qualification : undefined,
        experience: formData.role === 'doctor' ? formData.experience : undefined,
      };

      await register(userData);
      await login({ email: formData.email, password: formData.password });
      navigate(`/${formData.role}-dashboard`);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex overflow-hidden font-body animate-slide-up">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-2/5 relative bg-slate-900 items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        
        <div className="relative z-10 w-full space-y-8 animate-reveal">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-500 rounded-2xl">
              <Droplets className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white">ThalAI Guardian</h1>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-display font-extrabold text-white leading-tight">
              Start your <span className="text-sky-400">Lifesaving</span> Journey Today.
            </h2>
            <p className="text-lg text-slate-300">
              Join our community of heroes and healthcare professionals. Together, we make a difference.
            </p>
          </div>

          <div className="space-y-4 pt-4">
             {[
               { icon: <Heart className="w-5 h-5 text-rose-400" />, text: 'Help those in need' },
               { icon: <Stethoscope className="w-5 h-5 text-emerald-400" />, text: 'Manage patient care' },
               { icon: <Briefcase className="w-5 h-5 text-amber-400" />, text: 'Predictive health insights' }
             ].map((item, idx) => (
               <div key={idx} className="flex items-center gap-3 text-slate-200">
                 <div className="p-2 bg-slate-800/50 rounded-lg">{item.icon}</div>
                 <span className="font-medium">{item.text}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-3/5 flex flex-col justify-start items-center p-6 lg:p-12 bg-slate-50/50 relative overflow-y-auto">
        <div className="absolute inset-0 bg-dots opacity-5 pointer-events-none" />
        
        <div className="w-full max-w-xl relative z-10 animate-reveal">
          <div className="mb-8 flex justify-between items-end">
             <div>
                <h3 className="text-3xl font-display font-black text-slate-900 mb-1">Create Account</h3>
                <p className="text-slate-500 font-medium">Join our healthcare initiative</p>
             </div>
             <div className="flex items-center gap-2 mb-1">
                <span className={`w-8 h-1.5 rounded-full transition-all duration-500 ${step === 1 ? 'bg-sky-500 w-12' : 'bg-slate-200'}`} />
                <span className={`w-8 h-1.5 rounded-full transition-all duration-500 ${step === 2 ? 'bg-sky-500 w-12' : 'bg-slate-200'}`} />
             </div>
          </div>

          <div className="bg-white p-8 lg:p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl mb-6 text-sm flex items-center gap-2 animate-fade">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                {error}
              </div>
            )}

            <form onSubmit={step === 2 ? handleSubmit : handleNext} className="space-y-6 flex-1 flex flex-col">
              {step === 1 ? (
                <div key="step1" className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${direction === 'left' ? 'animate-slide-left' : 'animate-fade'}`}>
                  <div className="md:col-span-2 space-y-2">
                    <label className="input-label">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                      <input
                        type="text" name="name" value={formData.name} onChange={handleChange} required
                        className="input-field pl-12" placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="input-label">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                      <input
                        type="email" name="email" value={formData.email} onChange={handleChange} required
                        className="input-field pl-12" placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="input-label">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                      <input
                        type="password" name="password" value={formData.password} onChange={handleChange} required
                        className="input-field pl-12" placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="input-label">Confirm Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                      <input
                        type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                        className="input-field pl-12" placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="input-label">I am a...</label>
                    <select
                      name="role" value={formData.role} onChange={handleChange} required
                      className="input-field appearance-none cursor-pointer"
                    >
                      <option value="patient">Patient</option>
                      <option value="donor">Donor</option>
                      <option value="doctor">Doctor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="input-label">Blood Group</label>
                    <select
                      name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required
                      className="input-field appearance-none cursor-pointer"
                    >
                      <option value="">Select</option>
                      {bloodGroups.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 pt-4">
                    <button type="submit" className="btn-primary w-full py-4">
                      Continue <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div key="step2" className="flex-1 flex flex-col animate-slide-right">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="input-label">Phone Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        <input
                          type="tel" name="phone" value={formData.phone} onChange={handleChange}
                          className="input-field pl-12" placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="input-label">Date of Birth</label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors pointer-events-none" />
                        <input
                          type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
                          className="input-field pl-12"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="input-label">Street Address</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        <input
                          type="text" name="street" value={formData.street} onChange={handleChange}
                          className="input-field pl-12" placeholder="123 Health St."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 md:col-span-2">
                      <div className="space-y-2">
                        <label className="input-label">City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} className="input-field" placeholder="City" />
                      </div>
                      <div className="space-y-2">
                        <label className="input-label">State</label>
                        <input type="text" name="state" value={formData.state} onChange={handleChange} className="input-field" placeholder="State" />
                      </div>
                      <div className="space-y-2">
                        <label className="input-label">Zip</label>
                        <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="input-field" placeholder="00000" />
                      </div>
                    </div>

                    {formData.role === 'doctor' && (
                      <div className="md:col-span-2 pt-4 border-t border-slate-100 mt-4 space-y-6">
                        <h4 className="font-display font-bold text-slate-800 flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-500" /> Professional Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="input-label">License Number</label>
                            <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} required className="input-field" placeholder="MED-123456" />
                          </div>
                          <div className="space-y-2">
                            <label className="input-label">Specialization</label>
                            <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} required className="input-field" placeholder="Hematology" />
                          </div>
                          <div className="space-y-2">
                            <label className="input-label">Qualification</label>
                            <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} required className="input-field" placeholder="MBBS, MD" />
                          </div>
                          <div className="space-y-2">
                            <label className="input-label">Experience (Years)</label>
                            <input type="number" name="experience" value={formData.experience} onChange={handleChange} className="input-field" min="0" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-8 flex gap-4">
                    <button type="button" onClick={handleBack} className="btn-secondary flex-1 py-4">
                      Back
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary flex-[2] py-4">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating Account...
                        </>
                      ) : 'Complete Registration'}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-8 pt-6 border-t border-slate-50 text-center">
              <p className="text-slate-500 font-medium">
                Already part of the guardian?{' '}
                <Link to="/login" className="text-sky-600 font-bold hover:text-sky-700 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
