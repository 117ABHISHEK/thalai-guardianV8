import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../api/auth';
import { getPredictionStatus, triggerPrediction } from '../api/patient';
import PatientRequestForm from './PatientRequestForm';
import PatientRequestHistory from './PatientRequestHistory';
import StatCard from '../components/StatCard';
import HealthMetricsForm from '../components/HealthMetricsForm';
import AppointmentList from '../components/AppointmentList';
import ConnectionList from '../components/ConnectionList';
import NotificationList from '../components/NotificationList';
import TransfusionPrediction from '../components/TransfusionPrediction';
import TransfusionHistory from '../components/TransfusionHistory';

import { 
  User, Activity, ScrollText, History, 
  CalendarDays, Users, Bell, ArrowRight,
  ShieldCheck, Droplets, CheckCircle2,
  XCircle, Clock, Heart, Hospital
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { updatePatientMedicalData } from '../api/patient';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

const PatientDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location]);

  useEffect(() => {
    window.setPatientTab = setActiveTab;
    return () => { delete window.setPatientTab; };
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchPrediction();
  }, []);

  const fetchPrediction = async () => {
    try {
      setPredictionLoading(true);
      const response = await getPredictionStatus();
      if (response.data.success) setPrediction(response.data.data);
    } catch (error) {
      console.error('Failed to fetch prediction:', error);
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleRefreshPrediction = async () => {
    try {
      setPredictionLoading(true);
      const response = await triggerPrediction();
      if (response.data.success) {
        setPrediction(response.data.data);
        setMessage(response.data.message || 'Prediction updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update prediction');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setPredictionLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data.user);
      if (response.data.patient) setPatientProfile(response.data.patient);
      
      const u = response.data.user;
      setFormData({
        name: u.name || '',
        phone: u.phone || '',
        street: u.address?.street || '',
        city: u.address?.city || '',
        state: u.address?.state || '',
        zipCode: u.address?.zipCode || '',
        dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split('T')[0] : '',
        bloodGroup: u.bloodGroup || '',
        thalassemiaType: response.data.patient?.thalassemiaType || 'Beta Thalassemia Major',
        splenectomy: response.data.patient?.splenectomy || false,
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        dateOfBirth: formData.dateOfBirth,
        thalassemiaType: formData.thalassemiaType,
        splenectomy: formData.splenectomy,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        }
      };
      const response = await updateProfile(updateData);
      setProfile(response.data.user);
      updateUser(response.data.user);
      setMessage('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
      handleRefreshPrediction();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to update profile');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleHealthMetricsUpdate = async (metrics) => {
    try {
      setLoading(true);
      await updatePatientMedicalData(metrics);
      setMessage('Health metrics updated successfully!');
      fetchProfile();
      fetchPrediction();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to update health metrics');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransfusion = async (entry) => {
    try {
      setPredictionLoading(true);
      const newHistory = [...(patientProfile?.transfusionHistory || []), entry];
      await updatePatientMedicalData({ transfusionHistory: newHistory, currentHb: entry.hb_value });
      setMessage('Transfusion record added!');
      fetchProfile();
      fetchPrediction();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to add transfusion record');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setPredictionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'My Identity', icon: User },
    { id: 'health', label: 'Health Vitals', icon: Activity },
    { id: 'request', label: 'New Request', icon: ScrollText },
    { id: 'history', label: 'Requests', icon: History },
    { id: 'transfusion', label: 'Transfusions', icon: Activity },
    { id: 'appointments', label: 'Visits', icon: CalendarDays },
    { id: 'connections', label: 'Circles', icon: Users },
    { id: 'notifications', label: 'Alerts', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-transparent font-body pb-32">
      {/* Premium Header */}
      <div className="glass border-b border-slate-100 sticky top-16 md:top-20 z-40">
        <div className="container-custom py-6 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6 animate-reveal">
               <ProfilePictureUpload size="w-20 h-20" />
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-sky-100">
                       Patient Hub
                     </span>
                  </div>
                  <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight leading-tight">
                    Guardian <span className="text-sky-500">Dashboard</span>
                  </h1>
                  <p className="text-slate-500 font-medium mt-1.5 flex items-center gap-2">
                    Welcome back, <span className="text-slate-900 font-bold">{user?.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-4 animate-reveal" style={{ animationDelay: '0.1s' }}>
                <div className="px-6 py-3 bg-white border border-slate-200 rounded-[28px] shadow-sm flex items-center gap-6">
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                      <p className="text-xl font-display font-black text-rose-500">{user?.bloodGroup}</p>
                   </div>
                   <div className="h-10 w-[1px] bg-slate-100" />
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hb Level</p>
                      <p className="text-xl font-display font-black text-sky-500">{patientProfile?.currentHb || '--'}</p>
                   </div>
                </div>
            </div>
          </div>
        </div>

        {/* Improved Tabs */}
        <div className="container-custom">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-sky-500 text-sky-600 bg-sky-50/50'
                    : 'border-transparent text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-sky-500' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom pt-8 md:pt-12">
        {message && (
          <div className="mb-8 animate-reveal">
            <div className={`p-4 rounded-[24px] flex items-center gap-3 border shadow-sm ${
              message.toLowerCase().match(/success|added|updated/) ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}>
              <div className={`p-1.5 rounded-full ${message.toLowerCase().match(/success|added|updated/) ? 'bg-emerald-200 text-emerald-700' : 'bg-rose-200 text-rose-700'}`}>
                {message.toLowerCase().match(/success|added|updated/) ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              </div>
              <span className="font-bold text-sm tracking-tight">{message}</span>
            </div>
          </div>
        )}

        {/* Prediction Hero Section */}
        {activeTab === 'profile' && 
          <div className="mb-10 animate-reveal">
            <TransfusionPrediction prediction={prediction} onRefresh={handleRefreshPrediction} loading={predictionLoading} />
          </div>
        }

        <div className="animate-reveal" style={{ animationDelay: '0.1s' }}>
          {activeTab === 'profile' && (
            <div className="card-premium">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">Personal Profile</h2>
                  <p className="text-slate-500 font-medium">Manage your identity and medical basic data</p>
                </div>
                {!editing && (
                  <button onClick={() => setEditing(true)} className="btn-secondary px-8">
                    Update Profile
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    <div className="space-y-2">
                       <label className="input-label">Display Name</label>
                       <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" />
                    </div>
                    <div className="space-y-2 text-slate-400">
                       <label className="input-label">Email Address (Fixed)</label>
                       <input type="email" value={profile?.email} disabled className="input-field bg-slate-50 grayscale opacity-50 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                       <label className="input-label">Blood Group</label>
                       <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required className="input-field">
                          <option value="A+">A+</option><option value="A-">A-</option>
                          <option value="B+">B+</option><option value="B-">B-</option>
                          <option value="AB+">AB+</option><option value="AB-">AB-</option>
                          <option value="O+">O+</option><option value="O-">O-</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="input-label">Phone Contact</label>
                       <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-field" placeholder="xxx-xxx-xxxx" />
                    </div>
                    <div className="space-y-2">
                       <label className="input-label">Date of Birth</label>
                       <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="input-field" />
                    </div>
                    <div className="space-y-2">
                       <label className="input-label">Thalassemia Type</label>
                       <select name="thalassemiaType" value={formData.thalassemiaType} onChange={handleChange} className="input-field">
                          <option value="Beta Thalassemia Major">Beta Thalassemia Major</option>
                          <option value="Beta Thalassemia Intermedia">Beta Thalassemia Intermedia</option>
                          <option value="E-Beta Thalassemia">E-Beta Thalassemia</option>
                          <option value="Alpha Thalassemia (HbH)">Alpha Thalassemia (HbH)</option>
                       </select>
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                       <input type="checkbox" name="splenectomy" id="splenectomy" checked={formData.splenectomy} onChange={handleChange} className="w-5 h-5 rounded border-slate-300 text-sky-500 focus:ring-sky-500" />
                       <label htmlFor="splenectomy" className="text-sm font-bold text-slate-700">Splenectomy Performed</label>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100">
                    <h3 className="text-xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
                       <ShieldCheck className="w-6 h-6 text-sky-500" /> Residency Details
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-2 space-y-2">
                        <label className="input-label">Street Address</label>
                        <input type="text" name="street" value={formData.street} onChange={handleChange} className="input-field" />
                      </div>
                      <div className="space-y-2">
                        <label className="input-label">City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} className="input-field" />
                      </div>
                      <div className="space-y-2">
                        <label className="input-label">State</label>
                        <input type="text" name="state" value={formData.state} onChange={handleChange} className="input-field" />
                      </div>
                      <div className="space-y-2">
                        <label className="input-label">Zip Code</label>
                        <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="input-field" placeholder="123456" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button type="submit" className="btn-primary flex-[2]">Publish Changes</button>
                    <button type="button" onClick={() => { setEditing(false); fetchProfile(); }} className="btn-secondary flex-1">Discard</button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                  {[
                    { label: 'Name', value: profile?.name, icon: User, color: 'text-sky-500', bg: 'bg-sky-50' },
                    { label: 'Role', value: profile?.role, icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-50', capitalize: true },
                    { label: 'Blood Group', value: profile?.bloodGroup, icon: Droplets, color: 'text-rose-500', bg: 'bg-rose-50' },
                    { label: 'Thalassemia Type', value: patientProfile?.thalassemiaType || 'Not set', icon: Heart, color: 'text-sky-500', bg: 'bg-sky-50' },
                    { label: 'Splenectomy', value: patientProfile?.splenectomy ? 'Performed' : 'Not Performed', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Phone', value: profile?.phone || 'Not linked', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Email', value: profile?.email, icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50', full: true },
                    { label: 'Birth Date', value: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Not set', icon: CalendarDays, color: 'text-purple-500', bg: 'bg-purple-50' }
                  ].map((item, idx) => (
                    <div key={idx} className={`p-6 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white transition-all group ${item.full ? 'md:col-span-2' : ''}`}>
                       <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-xl bg-white shadow-sm group-hover:${item.bg} group-hover:${item.color} transition-all`}>
                             <item.icon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                       </div>
                       <p className={`text-xl font-bold text-slate-900 ${item.capitalize ? 'capitalize' : ''}`}>{item.value}</p>
                    </div>
                  ))}
                  
                  {profile?.address && (
                    <div className="col-span-full mt-4 p-8 bg-slate-900 rounded-[40px] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
                           <Users className="w-48 h-48" />
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Mailing Address</p>
                        <h4 className="text-3xl font-display font-black leading-tight max-w-2xl relative z-10">
                          {profile.address.street && `${profile.address.street}, `}
                          {profile.address.city && `${profile.address.city}, `}
                          {profile.address.state && <span className="text-sky-400">{profile.address.state}</span>}
                          {profile.address.zipCode && <span className="text-slate-500 block text-lg font-medium mt-2">{profile.address.zipCode}</span>}
                        </h4>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'health' && (
            <div className="card-premium h-full animate-reveal">
               <div className="mb-10">
                  <h2 className="text-3xl font-display font-black text-slate-900">Health Reports</h2>
                  <p className="text-slate-500 font-medium">Keep your medical data up to date for better AI accuracy</p>
               </div>
               <HealthMetricsForm initialData={patientProfile} onSave={handleHealthMetricsUpdate} loading={loading} role="patient" />
            </div>
          )}

          {activeTab === 'request' && <div className="animate-reveal"><PatientRequestForm onRequestCreated={() => setActiveTab('history')} /></div>}
          {activeTab === 'history' && <div className="animate-reveal"><PatientRequestHistory onRequestCancelled={() => { }} /></div>}
          {activeTab === 'transfusion' && <div className="card-premium animate-reveal"><TransfusionHistory history={patientProfile?.transfusionHistory || []} onAdd={handleAddTransfusion} loading={predictionLoading} /></div>}
          {activeTab === 'appointments' && <div className="card-premium animate-reveal"><div className="mb-8"><h2 className="text-2xl font-display font-black text-slate-900">Doctor Consultations</h2></div><AppointmentList role="patient" /></div>}
          {activeTab === 'connections' && <div className="card-premium animate-reveal"><div className="mb-8"><h2 className="text-2xl font-display font-black text-slate-900">Donor Support Circles</h2></div><ConnectionList role="patient" /></div>}
          {activeTab === 'notifications' && <div className="max-w-3xl mx-auto animate-reveal"><div className="card-premium"><div className="mb-8"><h2 className="text-2xl font-display font-black text-slate-900">System Notifications</h2></div><NotificationList /></div></div>}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
