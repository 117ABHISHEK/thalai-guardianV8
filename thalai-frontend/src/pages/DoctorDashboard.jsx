import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { getDoctorStats, getAssignedPatients, getPatientDetails, updatePatientNotes as apiUpdateNotes, updatePatientMedicalData } from '../api/doctor';
import { getProfile, updateProfile } from '../api/auth';
import AppointmentList from '../components/AppointmentList';
import NotificationList from '../components/NotificationList';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import ProfilePictureUpload from '../components/ProfilePictureUpload';
import { 
  Users, ClipboardList, AlertTriangle, CheckCircle2, 
  X, Activity, ArrowRight, UserCheck, Search,
  History, Calendar, ShieldCheck, Thermometer,
  FileText, MessageSquare, MoreVertical, Info, Mail, Phone
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState({
    activePatientsCount: 0,
    totalPatientsAssigned: 0,
    patientsNeedingTransfusionSoon: 0,
    isVerified: false
  });
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('patients');
  const [profile, setProfile] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');
  const [updating, setUpdating] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location]);

  useEffect(() => {
    fetchDashboardData();
    fetchProfile();
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedPatient && patientDetails) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [selectedPatient, patientDetails]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, patientsRes] = await Promise.all([
        getDoctorStats(),
        getAssignedPatients()
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (patientsRes.data.success) setPatients(patientsRes.data.data.patients);
    } catch (err) {
      console.error('General error:', err);
      setError(err.message || 'Failed to connect to medical records');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      const res = await getPatientDetails(patientId);
      if (res.data.success) {
        setPatientDetails(res.data.data.patient);
        setSelectedPatient(patientId);
      }
    } catch (err) {
      alert(err.message || 'Failed to load patient profile');
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await getProfile();
      setProfile(response.data.user);
      if (response.data.doctor) setDoctorProfile(response.data.doctor);
      
      const u = response.data.user;
      const d = response.data.doctor;
      setFormData({
        name: u.name || '',
        phone: u.phone || '',
        street: u.address?.street || '',
        city: u.address?.city || '',
        state: u.address?.state || '',
        zipCode: u.address?.zipCode || '',
        dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split('T')[0] : '',
        bloodGroup: u.bloodGroup || '',
        specialization: d?.specialization || '',
        qualification: d?.qualification || '',
        experience: d?.experience || 0,
        hospitalName: d?.hospital?.name || '',
        hospitalCity: d?.hospital?.city || '',
      });
    } catch (err) {
      console.error('Failed to update medical profile:', err);
    }
  };

  const handleSecureMessage = (email) => {
    window.open(`mailto:${email}?subject=Clinical Follow-up: ThalAI Guardian`, '_blank');
  };

  const handlePriorityCall = (phone) => {
    if (!phone) {
      alert('Mobile protocol not synced for this node.');
      return;
    }
    window.open(`tel:${phone}`, '_self');
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        bloodGroup: formData.bloodGroup,
        dateOfBirth: formData.dateOfBirth,
        specialization: formData.specialization,
        qualification: formData.qualification,
        experience: formData.experience,
        hospital: {
          name: formData.hospitalName,
          city: formData.hospitalCity,
        },
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        }
      };
      const response = await updateProfile(updateData);
      setProfile(response.data.user);
      setMessage('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.message || 'Failed to update profile');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setUpdating(false);
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
    { id: 'patients', label: 'Patient Register', icon: Users },
    { id: 'appointments', label: 'Clinical Visits', icon: Calendar },
    { id: 'profile', label: 'My Identity', icon: UserCheck },
    { id: 'notifications', label: 'Urgent Alerts', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-transparent font-body pb-64 animate-slide-up">
      {/* Premium Medical Header */}
      <div className="glass border-b border-slate-100 sticky top-16 md:top-20 z-40">
        <div className="container-custom py-6 md:py-10">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-reveal">
              <div className="flex items-center gap-6">
                 <ProfilePictureUpload size="w-16 h-16 md:w-20 md:h-20" />
                 <div>
                    <div className="flex items-center gap-2 mb-2">
                       <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-sky-100">
                          Medical Practitioner Hub
                       </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tight leading-tight">
                       Doctor <span className="text-sky-500 text-gradient">{user?.name}</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Reviewing clinical care for <span className="text-slate-900 font-bold">{stats.activePatientsCount} patients</span></p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="px-6 py-3 bg-white border border-slate-200 rounded-[24px] shadow-sm flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${stats.isVerified ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical ID Status</p>
                       <p className="text-sm font-bold text-slate-900">{stats.isVerified ? 'Verified Practice' : 'Pending Verification'}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Tab Navigation */}
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

      <div className="container-custom py-8 md:py-12">
        {activeTab === 'patients' ? (
          <div className="space-y-10 animate-reveal">
             {/* Key Metrics */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard title="Assigned Cases" value={stats.totalPatientsAssigned} icon={<Users className="w-6 h-6" />} color="blue" subtitle="Total patients in your circle" />
                <StatCard title="Active Protocol" value={stats.activePatientsCount} icon={<Activity className="w-6 h-6" />} color="green" subtitle="Currently in treatment phase" />
                <StatCard title="Urgent Updates" value={stats.patientsNeedingTransfusionSoon} icon={<AlertTriangle className="w-6 h-6" />} color="red" subtitle="Transfusion requirement predicted" />
             </div>

             {/* Patient Registry Table */}
             <div className="card-premium overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-2xl font-display font-black text-slate-900">Clinical Registry</h2>
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="Filter patient ID..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                   </div>
                </div>

                <div className="overflow-x-auto -mx-8">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="bg-slate-50/50 border-y border-slate-100">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Case Profile</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Enrolled</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {patients.length === 0 ? (
                           <tr>
                              <td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-medium italic">No cases currently assigned to your practice hub.</td>
                           </tr>
                        ) : patients.map((assignment, idx) => (
                           <tr key={assignment._id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                              <td className="px-8 py-6" onClick={() => fetchPatientDetails(assignment.patient._id)}>
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-black text-xs">
                                       {assignment.patient?.user?.name?.charAt(0) || 'P'}
                                    </div>
                                    <div>
                                       <p className="font-bold text-slate-900 group-hover:text-sky-600 transition-colors">{assignment.patient?.user?.name || 'Unknown'}</p>
                                       <p className="text-xs text-slate-400 font-medium">{assignment.patient?.user?.email}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-sm font-black text-rose-500" onClick={() => fetchPatientDetails(assignment.patient._id)}>{assignment.patient?.user?.bloodGroup || 'UNK'}</td>
                              <td className="px-8 py-6 text-sm text-slate-500 font-medium" onClick={() => fetchPatientDetails(assignment.patient._id)}>{new Date(assignment.assignedDate).toLocaleDateString()}</td>
                              <td className="px-8 py-6" onClick={() => fetchPatientDetails(assignment.patient._id)}>
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                    assignment.status === 'active' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-500'
                                 }`}>
                                    {assignment.status}
                                 </span>
                              </td>
                              <td className="px-8 py-6 text-right relative">
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === assignment._id ? null : assignment._id); }}
                                   className={`p-2.5 rounded-xl transition-all ${activeDropdown === assignment._id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:text-sky-600'}`}
                                 >
                                    <MoreVertical className="w-4 h-4" />
                                 </button>

                                 {activeDropdown === assignment._id && (
                                   <>
                                     <div className="fixed inset-0 z-[9998]" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} />
                                     <div className="absolute right-8 top-full mt-2 w-56 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2.5 z-[9999] animate-reveal text-left">
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); fetchPatientDetails(assignment.patient._id); setActiveDropdown(null); }}
                                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                        >
                                           <Info className="w-4 h-4" /> Clinical Profile
                                        </button>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handleSecureMessage(assignment.patient.user.email); setActiveDropdown(null); }}
                                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                        >
                                           <Mail className="w-4 h-4" /> Secure Message
                                        </button>
                                        <button 
                                          onClick={(e) => { e.stopPropagation(); handlePriorityCall(assignment.patient.user.phone); setActiveDropdown(null); }}
                                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                        >
                                           <Phone className="w-4 h-4" /> Priority Call
                                        </button>
                                        <div className="h-[1px] bg-slate-50 my-1.5 mx-2" />
                                        <p className="px-4 py-1 text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">CASE: {assignment._id.slice(-12)}</p>
                                     </div>
                                   </>
                                 )}
                              </td>
                           </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        ) : activeTab === 'appointments' ? (
          <div className="card-premium animate-reveal">
             <div className="mb-8"><h2 className="text-2xl font-display font-black text-slate-900">Clinical Schedule</h2></div>
             <AppointmentList role="doctor" />
          </div>
        ) : activeTab === 'profile' ? (
          <div className="space-y-10 animate-reveal">
             {message && (
               <div className="p-4 rounded-[24px] bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-bold">{message}</span>
               </div>
             )}

             <div className="card-premium">
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <h2 className="text-3xl font-display font-black text-slate-900">Medical Identity</h2>
                      <p className="text-slate-500 font-medium">Professional credentials and registration data</p>
                   </div>
                   {!editing && (
                      <button onClick={() => setEditing(true)} className="btn-secondary px-8">
                         Refine Profile
                      </button>
                   )}
                </div>

                {editing ? (
                   <form onSubmit={handleProfileSubmit} className="space-y-10">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                         <div className="space-y-2">
                            <label className="input-label">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleProfileChange} required className="input-field" />
                         </div>
                         <div className="space-y-2">
                            <label className="input-label">Specialization</label>
                            <input type="text" name="specialization" value={formData.specialization} onChange={handleProfileChange} className="input-field" />
                         </div>
                         <div className="space-y-2">
                            <label className="input-label">Highest Qualification</label>
                            <input type="text" name="qualification" value={formData.qualification} onChange={handleProfileChange} className="input-field" />
                         </div>
                         <div className="space-y-2">
                            <label className="input-label">Experience (Years)</label>
                            <input type="number" name="experience" value={formData.experience} onChange={handleProfileChange} className="input-field" />
                         </div>
                         <div className="space-y-2">
                            <label className="input-label">Primary Hospital</label>
                            <input type="text" name="hospitalName" value={formData.hospitalName} onChange={handleProfileChange} className="input-field" />
                         </div>
                         <div className="space-y-2">
                            <label className="input-label">Hospital City</label>
                            <input type="text" name="hospitalCity" value={formData.hospitalCity} onChange={handleProfileChange} className="input-field" />
                         </div>
                         <div className="space-y-2">
                            <label className="input-label">Contact Phone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleProfileChange} className="input-field" />
                         </div>
                         <div className="space-y-2">
                            <label className="input-label">Blood Group</label>
                            <select name="bloodGroup" value={formData.bloodGroup} onChange={handleProfileChange} className="input-field">
                               <option value="A+">A+</option><option value="A-">A-</option>
                               <option value="B+">B+</option><option value="B-">B-</option>
                               <option value="AB+">AB+</option><option value="AB-">AB-</option>
                               <option value="O+">O+</option><option value="O-">O-</option>
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="input-label">Date of Birth</label>
                            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleProfileChange} className="input-field" />
                         </div>
                      </div>

                      <div className="pt-8 border-t border-slate-100">
                        <h3 className="text-xl font-display font-bold text-slate-900 mb-6">Clinic Address</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                           <div className="sm:col-span-2 lg:col-span-2 space-y-2">
                              <label className="input-label">Street</label>
                              <input type="text" name="street" value={formData.street} onChange={handleProfileChange} className="input-field" />
                           </div>
                           <div className="space-y-2">
                              <label className="input-label">City</label>
                              <input type="text" name="city" value={formData.city} onChange={handleProfileChange} className="input-field" />
                           </div>
                           <div className="space-y-2">
                              <label className="input-label">State</label>
                              <input type="text" name="state" value={formData.state} onChange={handleProfileChange} className="input-field" />
                           </div>
                           <div className="space-y-2">
                              <label className="input-label">Zip Code</label>
                              <input type="text" name="zipCode" value={formData.zipCode} onChange={handleProfileChange} className="input-field" />
                           </div>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-6">
                         <button type="submit" disabled={updating} className="btn-primary flex-[2]">
                            {updating ? 'Syncing...' : 'Publish Credentials'}
                         </button>
                         <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex-1">Discard</button>
                      </div>
                   </form>
                ) : (
                   <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                      {[
                         { label: 'License Number', value: doctorProfile?.licenseNumber, icon: ShieldCheck, color: 'text-sky-500', bg: 'bg-sky-50' },
                         { label: 'Specialty', value: doctorProfile?.specialization, icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                         { label: 'Experience', value: `${doctorProfile?.experience || 0} Years`, icon: History, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                         { label: 'Education', value: doctorProfile?.qualification, icon: ClipboardList, color: 'text-amber-500', bg: 'bg-amber-50' },
                         { label: 'Blood Group', value: profile?.bloodGroup, icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
                         { label: 'Hospital', value: doctorProfile?.hospital?.name || 'Private Practice', icon: Activity, color: 'text-sky-500', bg: 'bg-sky-50', full: true },
                      ].map((item, idx) => (
                         <div key={idx} className={`p-6 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white transition-all group ${item.full ? 'md:col-span-2' : ''}`}>
                            <div className="flex items-center gap-3 mb-3">
                               <div className={`p-2 rounded-xl bg-white shadow-sm group-hover:${item.bg} group-hover:${item.color} transition-all`}>
                                  <item.icon className="w-5 h-5" />
                               </div>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                            </div>
                            <p className="text-xl font-bold text-slate-900">{item.value || 'Not Configured'}</p>
                         </div>
                      ))}
                      
                      <div className="col-span-full mt-4 p-8 bg-slate-900 rounded-[40px] text-white overflow-hidden relative group">
                         <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <Users className="w-48 h-48" />
                         </div>
                         <div className="relative z-10">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Practice Location</p>
                            <h4 className="text-3xl font-display font-black leading-tight max-w-2xl">
                               {profile?.address?.street && `${profile.address.street}, `}
                               {profile?.address?.city && `${profile.address.city}, `}
                               {profile?.address?.state && <span className="text-sky-400">{profile.address.state}</span>}
                               {profile?.address?.zipCode && <span className="text-slate-500 block text-lg font-medium mt-2">PIN: {profile.address.zipCode}</span>}
                               {!profile?.address?.street && 'Location Sync Pending'}
                            </h4>
                         </div>
                      </div>
                   </div>
                )}
             </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto animate-reveal">
             <div className="card-premium">
                <div className="mb-8"><h2 className="text-2xl font-display font-black text-slate-900">Laboratory Alerts</h2></div>
                <NotificationList />
             </div>
          </div>
        )}

         {/* Improved Patient Details Modal */}
         {selectedPatient && patientDetails && createPortal(
           <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-reveal" style={{ margin: 0 }}>
             <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-slate-200 relative" style={{ zIndex: 10000 }}>
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
                     <UserCheck className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em] mb-1">Clinical Case Profile</p>
                    <h3 className="text-2xl font-display font-black tracking-tight">{patientDetails.user?.name}</h3>
                  </div>
                </div>
                <button onClick={() => { setSelectedPatient(null); setPatientDetails(null); }} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-10 pb-20 space-y-12">
                 <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Col: Vitals */}
                    <div className="lg:col-span-2 space-y-10">
                       <section>
                          <h4 className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest mb-6">
                            <Thermometer className="w-4 h-4 text-rose-500" /> Biological Markers
                          </h4>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood Type</p>
                                <p className="text-2xl font-bold text-rose-500">{patientDetails.user?.bloodGroup}</p>
                             </div>
                             <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Hemoglobin</p>
                                <p className="text-2xl font-bold text-sky-500">{patientDetails.currentHb || '0.0'} <span className="text-xs text-slate-400">g/dL</span></p>
                             </div>
                          </div>
                       </section>

                       <section>
                          <h4 className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest mb-6">
                            <Activity className="w-4 h-4 text-emerald-500" /> AI Prognosis History
                          </h4>
                          {patientDetails.predictedNextTransfusionDate ? (
                             <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-[32px] space-y-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Next Transfusion Window</p>
                                     <p className="text-xl font-bold text-slate-900">{new Date(patientDetails.predictedNextTransfusionDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Confidance</p>
                                     <p className="text-xl font-bold text-emerald-600">{Math.round((patientDetails.predictionConfidence || 0) * 100)}%</p>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-600 font-medium italic leading-relaxed border-t border-emerald-100 pt-4">"{patientDetails.predictionExplanation}"</p>
                             </div>
                          ) : (
                             <div className="p-8 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                                <p className="text-slate-400 font-medium">Insufficient data for AI predictive cycle.</p>
                             </div>
                          )}
                       </section>
                    </div>

                    {/* Right Col: Contact & Action */}
                    <div className="space-y-8 lg:border-l lg:border-slate-100 lg:pl-8">
                       <section>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Patient Connect</h4>
                          <div className="space-y-3">
                             <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                <MessageSquare className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-bold text-slate-600 truncate">{patientDetails.user?.email}</span>
                             </div>
                             <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-bold text-slate-600">{patientDetails.user?.phone || 'No phone'}</span>
                             </div>
                          </div>
                       </section>

                       <section className="p-6 bg-slate-900 rounded-3xl text-white">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Rapid Note</h4>
                          <textarea id="patient-notes" className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 mb-3" rows="3" placeholder="Notes for clinical round..." defaultValue={patients.find(p => p.patient._id === selectedPatient)?.notes || ''} />
                          <button onClick={() => apiUpdateNotes(selectedPatient, document.getElementById('patient-notes').value).then(() => alert('Notes sync successful'))} className="w-full btn-primary py-3 text-xs">Sync Notes</button>
                       </section>
                    </div>
                 </div>


                  {/* Medical History with Audit Trail */}
                  <section className="pt-10 border-t border-slate-100">
                     <h4 className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest mb-6">
                       <History className="w-4 h-4 text-purple-500" /> Complete Medical History
                     </h4>
                     
                     {/* Transfusion History */}
                     <div className="mb-8">
                        <h5 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4">Transfusion Records</h5>
                        {patientDetails.transfusionHistory && patientDetails.transfusionHistory.length > 0 ? (
                           <div className="space-y-3">
                              {patientDetails.transfusionHistory.slice().reverse().map((record, idx) => (
                                 <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-sky-300 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                       <div className="flex-1">
                                          <p className="text-sm font-bold text-slate-900">
                                             {new Date(record.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                          </p>
                                          <p className="text-xs text-slate-500 mt-1">
                                             Units: <span className="font-bold text-slate-700">{record.units}</span> • 
                                             Hb: <span className="font-bold text-rose-500">{record.hb_value} g/dL</span>
                                             {record.doctor && ` • Doctor: ${record.doctor}`}
                                          </p>
                                          {record.notes && (
                                             <p className="text-xs text-slate-600 mt-2 italic">"{record.notes}"</p>
                                          )}
                                       </div>
                                       {record.addedBy && (
                                          <div className="ml-4 text-right">
                                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Added By</p>
                                             <p className="text-xs font-bold text-sky-600 capitalize">{record.addedBy.name}</p>
                                             <p className="text-[9px] text-slate-400 capitalize">({record.addedBy.role})</p>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                              <p className="text-sm text-slate-400 font-medium">No transfusion records available</p>
                           </div>
                        )}
                     </div>

                     {/* Medical Reports */}
                     <div className="mb-8">
                        <h5 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-4">Laboratory Reports</h5>
                        {patientDetails.medicalReports && patientDetails.medicalReports.length > 0 ? (
                           <div className="space-y-3">
                              {patientDetails.medicalReports.slice().reverse().map((report, idx) => (
                                 <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-emerald-300 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                       <div className="flex-1">
                                          <p className="text-sm font-bold text-slate-900">{report.title}</p>
                                          <p className="text-xs text-slate-500 mt-1">
                                             {new Date(report.reportDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                          </p>
                                          <div className="grid grid-cols-3 gap-2 mt-3">
                                             {report.hemoglobin && (
                                                <div className="text-xs">
                                                   <span className="text-slate-400">Hb:</span> <span className="font-bold text-rose-500">{report.hemoglobin}</span>
                                                </div>
                                             )}
                                             {report.ferritin && (
                                                <div className="text-xs">
                                                   <span className="text-slate-400">Ferritin:</span> <span className="font-bold text-amber-600">{report.ferritin}</span>
                                                </div>
                                             )}
                                             {report.sgpt && (
                                                <div className="text-xs">
                                                   <span className="text-slate-400">SGPT:</span> <span className="font-bold text-sky-600">{report.sgpt}</span>
                                                </div>
                                             )}
                                             {report.sgot && (
                                                <div className="text-xs">
                                                   <span className="text-slate-400">SGOT:</span> <span className="font-bold text-sky-600">{report.sgot}</span>
                                                </div>
                                             )}
                                             {report.creatinine && (
                                                <div className="text-xs">
                                                   <span className="text-slate-400">Creatinine:</span> <span className="font-bold text-purple-600">{report.creatinine}</span>
                                                </div>
                                             )}
                                          </div>
                                          {report.notes && (
                                             <p className="text-xs text-slate-600 mt-2 italic">"{report.notes}"</p>
                                          )}
                                       </div>
                                       {report.addedBy && (
                                          <div className="ml-4 text-right">
                                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Added By</p>
                                             <p className="text-xs font-bold text-emerald-600 capitalize">{report.addedBy.name}</p>
                                             <p className="text-[9px] text-slate-400 capitalize">({report.addedBy.role})</p>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                              <p className="text-sm text-slate-400 font-medium">No medical reports available</p>
                           </div>
                        )}
                     </div>
                  </section>

                  {/* Add New Transfusion Record */}
                  <section className="pt-10 border-t border-slate-100">
                     <h4 className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest mb-6">
                       <FileText className="w-4 h-4 text-indigo-500" /> Add New Transfusion Record
                     </h4>
                     <div className="grid md:grid-cols-4 gap-4 bg-slate-50 p-6 rounded-[32px] items-end">
                        <div>
                          <label className="input-label">Record Date</label>
                          <input type="date" id="t-date" className="input-field py-2" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div>
                          <label className="input-label">Units Logged</label>
                          <input type="number" id="t-units" className="input-field py-2" defaultValue="1" min="1" />
                        </div>
                        <div>
                          <label className="input-label">Observed Hb</label>
                          <input type="number" id="t-hb" className="input-field py-2" step="0.1" placeholder="g/dL" />
                        </div>
                        <button onClick={async () => {
                          const date = document.getElementById('t-date').value;
                          const units = document.getElementById('t-units').value;
                          const hb = document.getElementById('t-hb').value;
                          if(!hb) return alert('Hb vital is required');
                          const newHistory = [...(patientDetails.transfusionHistory || []), { date: new Date(date), units: parseInt(units), hb_value: parseFloat(hb), doctor: user?.name || 'Assigned Doctor' }];
                          await updatePatientMedicalData(selectedPatient, { transfusionHistory: newHistory, currentHb: parseFloat(hb) });
                          alert('Vital recorded and history updated.');
                          fetchPatientDetails(selectedPatient); fetchDashboardData();
                        }} className="btn-primary py-3">Commit Record</button>
                     </div>
                  </section>

                  {/* Add New Medical Report */}
                  <section className="pt-10 border-t border-slate-100">
                     <h4 className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest mb-6">
                       <ClipboardList className="w-4 h-4 text-emerald-500" /> Add New Medical Report
                     </h4>
                     <div className="bg-slate-50 p-6 rounded-[32px] space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                           <div>
                              <label className="input-label">Report Title</label>
                              <input type="text" id="r-title" className="input-field py-2" placeholder="e.g., Monthly Blood Test" />
                           </div>
                           <div>
                              <label className="input-label">Report Date</label>
                              <input type="date" id="r-date" className="input-field py-2" defaultValue={new Date().toISOString().split('T')[0]} />
                           </div>
                        </div>
                        <div className="grid md:grid-cols-5 gap-4">
                           <div>
                              <label className="input-label">Hemoglobin (g/dL)</label>
                              <input type="number" id="r-hb" className="input-field py-2" step="0.1" placeholder="9.5" />
                           </div>
                           <div>
                              <label className="input-label">Ferritin (ng/mL)</label>
                              <input type="number" id="r-ferritin" className="input-field py-2" placeholder="1000" />
                           </div>
                           <div>
                              <label className="input-label">SGPT (U/L)</label>
                              <input type="number" id="r-sgpt" className="input-field py-2" placeholder="40" />
                           </div>
                           <div>
                              <label className="input-label">SGOT (U/L)</label>
                              <input type="number" id="r-sgot" className="input-field py-2" placeholder="35" />
                           </div>
                           <div>
                              <label className="input-label">Creatinine (mg/dL)</label>
                              <input type="number" id="r-creatinine" className="input-field py-2" step="0.1" placeholder="1.0" />
                           </div>
                        </div>
                        <div>
                           <label className="input-label">Clinical Notes</label>
                           <textarea id="r-notes" className="input-field py-2" rows="2" placeholder="Additional observations or recommendations..."></textarea>
                        </div>
                        <button onClick={async () => {
                          const title = document.getElementById('r-title').value;
                          const reportDate = document.getElementById('r-date').value;
                          const hemoglobin = document.getElementById('r-hb').value;
                          const ferritin = document.getElementById('r-ferritin').value;
                          const sgpt = document.getElementById('r-sgpt').value;
                          const sgot = document.getElementById('r-sgot').value;
                          const creatinine = document.getElementById('r-creatinine').value;
                          const notes = document.getElementById('r-notes').value;
                          
                          if(!title) return alert('Report title is required');
                          
                          const newReport = {
                             title,
                             reportDate: new Date(reportDate),
                             ...(hemoglobin && { hemoglobin: parseFloat(hemoglobin) }),
                             ...(ferritin && { ferritin: parseFloat(ferritin) }),
                             ...(sgpt && { sgpt: parseFloat(sgpt) }),
                             ...(sgot && { sgot: parseFloat(sgot) }),
                             ...(creatinine && { creatinine: parseFloat(creatinine) }),
                             ...(notes && { notes })
                          };
                          
                          const newReports = [...(patientDetails.medicalReports || []), newReport];
                          await updatePatientMedicalData(selectedPatient, { medicalReports: newReports });
                          alert('Medical report added successfully.');
                          fetchPatientDetails(selectedPatient); fetchDashboardData();
                          
                          // Clear form
                          document.getElementById('r-title').value = '';
                          document.getElementById('r-hb').value = '';
                          document.getElementById('r-ferritin').value = '';
                          document.getElementById('r-sgpt').value = '';
                          document.getElementById('r-sgot').value = '';
                          document.getElementById('r-creatinine').value = '';
                          document.getElementById('r-notes').value = '';
                        }} className="btn-primary w-full py-3">Add Medical Report</button>
                     </div>
                  </section>
              </div>
             </div>
           </div>,
           document.body
         )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
