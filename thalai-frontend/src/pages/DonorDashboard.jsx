import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../api/auth';
import { getDonorAvailability, updateDonorAvailability } from '../api/donor';
import StatCard from '../components/StatCard';
import HealthMetricsForm from '../components/HealthMetricsForm';
import AppointmentList from '../components/AppointmentList';
import ConnectionList from '../components/ConnectionList';
import NotificationList from '../components/NotificationList';
import MatchedRequests from '../components/MatchedRequests';
import ProfilePictureUpload from '../components/ProfilePictureUpload';

import { 
  Heart, CheckCircle, PauseCircle, Calendar, XCircle, 
  Clock, ClipboardList, ArrowRight, User, Settings,
  ShieldCheck, Activity, Users, Bell, UserCheck, AlertCircle
} from 'lucide-react';

const DonorDashboard = () => {
  const { user, logout, updateUser } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [donorProfile, setDonorProfile] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [availabilityForm, setAvailabilityForm] = useState({
    availabilityStatus: false,
    lastDonationDate: '',
  });
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, availabilityRes] = await Promise.all([
        getProfile(),
        getDonorAvailability(),
      ]);
      setProfile(profileRes.data.user);
      if (profileRes.data.donor) setDonorProfile(profileRes.data.donor);
      setAvailability(availabilityRes.data.donor);
      
      const u = profileRes.data.user;
      setFormData({
        name: u.name || '',
        phone: u.phone || '',
        street: u.address?.street || '',
        city: u.address?.city || '',
        state: u.address?.state || '',
        zipCode: u.address?.zipCode || '',
        dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split('T')[0] : '',
        bloodGroup: u.bloodGroup || '',
      });
      
      const d = availabilityRes.data.donor;
      setAvailabilityForm({
        availabilityStatus: d?.availabilityStatus || false,
        lastDonationDate: d?.lastDonationDate ? new Date(d.lastDonationDate).toISOString().split('T')[0] : '',
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilitySubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      const response = await updateDonorAvailability({
        availabilityStatus: availabilityForm.availabilityStatus,
        lastDonationDate: availabilityForm.lastDonationDate || undefined,
      });
      setAvailability(response.data.donor);
      setMessage('Availability updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to update availability');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleHealthMetricsUpdate = async (metrics) => {
    try {
      setLoading(true);
      const { updateDonorHealthData } = await import('../api/donor');
      await updateDonorHealthData(metrics);
      setMessage('Health metrics synchronized!');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to sync health data');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'matches', label: 'Matches', icon: Heart },
    { id: 'profile', label: 'My Identity', icon: User },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'connections', label: 'Circles', icon: Users },
    { id: 'health', label: 'Health', icon: ClipboardList },
    { id: 'notifications', label: 'Alerts', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-transparent font-body pb-64 animate-slide-up">
      {/* Premium Header */}
      <div className="glass border-b border-slate-100 sticky top-16 md:top-20 z-40">
        <div className="container-custom py-6 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6 animate-reveal">
              <ProfilePictureUpload size="w-20 h-20" />
              <div>
                <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight leading-tight">
                  Donor <span className="text-sky-500">Dashboard</span>
                </h1>
                <p className="text-slate-500 font-medium mt-1.5 flex items-center gap-2">
                  Welcome back, <span className="text-slate-900 font-bold">{user?.name}</span>
                  <span className="flex items-center gap-1.5 ml-2">
                     <span className={`w-2 h-2 rounded-full ${availability?.availabilityStatus ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                     <span className={`text-[10px] font-black uppercase tracking-widest ${availability?.availabilityStatus ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {availability?.availabilityStatus ? 'Visible' : 'Hidden'}
                     </span>
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 animate-reveal" style={{ animationDelay: '0.1s' }}>
                <div className="px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-4">
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Blood Group</p>
                      <p className="text-xl font-display font-black text-rose-500">{user?.bloodGroup}</p>
                   </div>
                   <div className="h-10 w-[1px] bg-slate-100" />
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                      <p className={`text-sm font-bold ${donorProfile?.isVerified ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {donorProfile?.isVerified ? 'Verified' : 'Pending'}
                      </p>
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
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-sky-500' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-custom py-8 md:py-12">
        {message && (
          <div className="mb-8 animate-reveal">
            <div className={`p-4 rounded-[20px] flex items-center gap-3 border shadow-sm ${
              message.includes('success') 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}>
              <div className={`p-1.5 rounded-full ${message.includes('success') ? 'bg-emerald-200' : 'bg-rose-200'}`}>
                {message.includes('success') ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              </div>
              <span className="font-bold text-sm tracking-tight">{message}</span>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-10">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <StatCard
                title="Donations Saved"
                value={availability?.totalDonations || 0}
                icon={<Heart className="w-6 h-6" />}
                color="red"
                subtitle="Lives impacted through your care"
              />
              <StatCard
                title="Availability"
                value={availability?.availabilityStatus ? 'Active' : 'Offline'}
                icon={availability?.availabilityStatus ? <CheckCircle className="w-6 h-6" /> : <PauseCircle className="w-6 h-6" />}
                color={availability?.availabilityStatus ? 'green' : 'red'}
                subtitle={availability?.availabilityStatus ? 'You are visible to patients' : 'You are currently invisible'}
              />
              <StatCard
                title="Last Visited"
                value={availability?.lastDonationDate ? new Date(availability.lastDonationDate).toLocaleDateString() : 'New Hero'}
                icon={<Calendar className="w-6 h-6" />}
                color="blue"
                subtitle="Your last contribution date"
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              {/* Eligibility Section */}
              <div className="card-premium">
                <div className="flex items-center justify-between mb-8">
                   <div>
                      <h2 className="text-2xl font-display font-black text-slate-900">Eligibility Profile</h2>
                      <p className="text-slate-500 text-sm font-medium">Verification and health checks</p>
                   </div>
                   <Link to="/donor-profile" className="p-3 bg-white shadow-sm border border-slate-100 rounded-2xl hover:text-sky-500 transition-all group">
                      <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                   </Link>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex items-center gap-4">
                         <div className={`p-3 rounded-2xl bg-white shadow-sm ${
                           donorProfile?.eligibilityStatus === 'eligible' ? 'text-emerald-500' : 
                           donorProfile?.eligibilityStatus === 'ineligible' ? 'text-rose-500' : 'text-amber-500'
                         }`}>
                            <ShieldCheck className="w-6 h-6" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Status</p>
                            <p className="text-lg font-bold text-slate-800 capitalize">{donorProfile?.eligibilityStatus || 'Pending'}</p>
                         </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${
                         donorProfile?.eligibilityStatus === 'eligible' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                         'bg-rose-50 border-rose-100 text-rose-600'
                      }`}>
                         {donorProfile?.eligibilityStatus === 'eligible' ? 'Confirmed' : 'Requirement'}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Identity', status: donorProfile?.isVerified, icon: UserCheck },
                        { label: 'Medical', status: donorProfile?.healthClearance, icon: ClipboardList },
                        { label: 'Reports', status: donorProfile?.medicalReports?.length > 0, icon: Activity }
                      ].map((item, i) => (
                        <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                           <item.icon className={`w-5 h-5 ${item.status ? 'text-emerald-500' : 'text-slate-300'}`} />
                           <span className={`text-sm font-bold ${item.status ? 'text-slate-900' : 'text-slate-400'}`}>{item.label}</span>
                           {item.status ? <CheckCircle className="w-3.5 h-3.5 ml-auto text-emerald-500" /> : <Clock className="w-3.5 h-3.5 ml-auto text-slate-200" />}
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* Quick Availability Actions */}
              <div className="card-premium">
                <div className="mb-8 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-display font-black text-slate-900">Preferences</h2>
                    <p className="text-slate-500 text-sm font-medium">Control your public visibility</p>
                  </div>
                  {!availabilityForm.availabilityStatus && (
                    <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase border border-rose-100 animate-pulse">Action Required</span>
                  )}
                </div>

                <form onSubmit={handleAvailabilitySubmit} className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-sky-50/50 rounded-3xl border border-sky-100 transition-all hover:bg-sky-50">
                    <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl bg-white shadow-sm ${availabilityForm.availabilityStatus ? 'text-sky-500' : 'text-slate-400'}`}>
                         <Activity className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg tracking-tight">Public Presence</p>
                        <p className="text-sm text-slate-500 font-medium">{availabilityForm.availabilityStatus ? 'You are visible as active' : 'Hidden from searches'}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="availabilityStatus"
                        checked={availabilityForm.availabilityStatus}
                        onChange={(e) => {
                          setAvailabilityForm({ ...availabilityForm, availabilityStatus: e.target.checked });
                          // Auto trigger save for a snappy feeling
                          setTimeout(() => document.getElementById('avail-submit').click(), 100);
                        }}
                        className="sr-only peer" 
                      />
                      <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-sky-500"></div>
                    </label>
                  </div>

                  <div className="space-y-2">
                    <label className="input-label">Recorded Last Donation</label>
                    <input
                      type="date"
                      name="lastDonationDate"
                      value={availabilityForm.lastDonationDate}
                      onChange={(e) => setAvailabilityForm({ ...availabilityForm, lastDonationDate: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <button id="avail-submit" type="submit" className="hidden">Save</button>
                  
                  {!availabilityForm.availabilityStatus && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3">
                       <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Visibility Critical</p>
                          <p className="text-[11px] text-rose-500 font-medium">You are currently hidden from patients. Enable visibility to appear in emergency search results.</p>
                       </div>
                    </div>
                  )}
                  
                  <div className="p-4 bg-slate-50 rounded-2xl text-xs font-bold text-slate-500 flex gap-3 italic">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    Updating this helps our AI accurately predict your next possible donation date.
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="card-premium animate-reveal">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">Personal Profile</h2>
                <p className="text-slate-500 font-medium">Manage your identity and bio-metric basic data</p>
              </div>
              {!editing && (
                <button onClick={() => setEditing(true)} className="btn-secondary px-8">
                  Update Profile
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  setLoading(true);
                  const updateData = {
                    name: formData.name,
                    phone: formData.phone,
                    bloodGroup: formData.bloodGroup,
                    dateOfBirth: formData.dateOfBirth,
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
                  setTimeout(() => setMessage(''), 3000);
                } catch (error) {
                  setMessage(error.message || 'Failed to update profile');
                  setTimeout(() => setMessage(''), 3000);
                } finally {
                  setLoading(false);
                }
              }} className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <label className="input-label">Display Name</label>
                    <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="input-label">Blood Group</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} className="input-field">
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                      <option value="O+">O+</option><option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="input-label">Phone Contact</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="input-field" />
                  </div>
                  <div className="space-y-2">
                    <label className="input-label">Date of Birth</label>
                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className="input-field" />
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h3 className="text-xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-sky-500" /> Residency details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="sm:col-span-2 lg:col-span-2 space-y-2">
                      <label className="input-label">Street Address</label>
                      <input type="text" name="street" value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} className="input-field" />
                    </div>
                    <div className="space-y-2">
                      <label className="input-label">City</label>
                      <input type="text" name="city" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="input-field" />
                    </div>
                    <div className="space-y-2">
                      <label className="input-label">Zip Code</label>
                      <input type="text" name="zipCode" value={formData.zipCode} onChange={(e) => setFormData({...formData, zipCode: e.target.value})} className="input-field" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button type="submit" className="btn-primary flex-[2]">Publish Changes</button>
                  <button type="button" onClick={() => { setEditing(false); fetchData(); }} className="btn-secondary flex-1">Discard</button>
                </div>
              </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {[
                  { label: 'Name', value: profile?.name, icon: User, color: 'text-sky-500', bg: 'bg-sky-50' },
                  { label: 'Role', value: profile?.role, icon: ShieldCheck, color: 'text-indigo-500', bg: 'bg-indigo-50', capitalize: true },
                  { label: 'Blood Group', value: profile?.bloodGroup, icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
                  { label: 'Phone', value: profile?.phone || 'Not linked', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'Email', value: profile?.email, icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50', full: true },
                  { label: 'Birth Date', value: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Not set', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50' }
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
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Location Synchronized</p>
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

        {activeTab === 'matches' && <div className="animate-reveal"><MatchedRequests /></div>}
        {activeTab === 'appointments' && <div className="animate-reveal"><div className="card-premium h-full"><AppointmentList role="donor" /></div></div>}
        {activeTab === 'connections' && <div className="animate-reveal"><div className="card-premium"><ConnectionList role="donor" /></div></div>}
        {activeTab === 'health' && <div className="animate-reveal"><div className="card-premium"><HealthMetricsForm initialData={donorProfile} onSave={handleHealthMetricsUpdate} loading={loading} role="donor" /></div></div>}
        {activeTab === 'notifications' && <div className="animate-reveal max-w-2xl mx-auto"><div className="card-premium"><NotificationList /></div></div>}
      </div>
    </div>
  );
};

export default DonorDashboard;
