import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getDoctorStats, getAssignedPatients, getPatientDetails, updatePatientNotes as apiUpdateNotes, updatePatientMedicalData } from '../api/doctor';
import AppointmentList from '../components/AppointmentList';
import NotificationList from '../components/NotificationList';
import StatCard from '../components/StatCard';
import { 
  Users, ClipboardList, AlertTriangle, CheckCircle2, 
  X, Activity, ArrowRight, UserCheck, Search,
  History, Calendar, ShieldCheck, Thermometer,
  FileText, MessageSquare, MoreVertical, Info, Mail, Phone
} from 'lucide-react';

const DoctorDashboard = () => {
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
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'patients', label: 'Patient Register', icon: Users },
    { id: 'appointments', label: 'Clinical Visits', icon: Calendar },
    { id: 'notifications', label: 'Urgent Alerts', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body">
      {/* Premium Medical Header */}
      <div className="bg-white border-b border-slate-100 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-reveal">
              <div>
                 <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-sky-100">
                      Medical Practitioner Hub
                    </span>
                 </div>
                 <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
                   Doctor <span className="text-sky-500">Workspace</span>
                 </h1>
                 <p className="text-slate-500 font-medium mt-1">Reviewing clinical care for <span className="text-slate-900 font-bold">{stats.activePatientsCount} patients</span></p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
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
                                     <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                                     <div className="absolute right-8 top-full mt-2 w-56 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2.5 z-50 animate-reveal text-left">
                                        <button 
                                          onClick={() => { fetchPatientDetails(assignment.patient._id); setActiveDropdown(null); }}
                                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                        >
                                           <Info className="w-4 h-4" /> Clinical Profile
                                        </button>
                                        <button 
                                          onClick={() => { alert('Opening secure messaging channel...'); setActiveDropdown(null); }}
                                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                        >
                                           <Mail className="w-4 h-4" /> Secure Message
                                        </button>
                                        <button 
                                          onClick={() => { alert('Initiating priority call...'); setActiveDropdown(null); }}
                                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                        >
                                           <Phone className="w-4 h-4" /> Direct Contact
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
        ) : (
          <div className="max-w-2xl mx-auto animate-reveal">
             <div className="card-premium">
                <div className="mb-8"><h2 className="text-2xl font-display font-black text-slate-900">Laboratory Alerts</h2></div>
                <NotificationList />
             </div>
          </div>
        )}

        {/* Improved Patient Details Modal */}
        {selectedPatient && patientDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 bg-slate-900/40 backdrop-blur-md animate-reveal">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden flex flex-col border border-white/20">
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
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
              <div className="flex-1 overflow-y-auto p-10 space-y-12">
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

                 {/* Transfusion Logging Sub-section */}
                 <section className="pt-10 border-t border-slate-100">
                    <h4 className="flex items-center gap-2 text-sm font-black text-slate-900 uppercase tracking-widest mb-6">
                      <FileText className="w-4 h-4 text-indigo-500" /> Update Clinical Records
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
                         const newHistory = [...(patientDetails.transfusionHistory || []), { date: new Date(date), units: parseInt(units), hb_value: parseFloat(hb), doctor: stats.name || 'Assigned Doctor' }];
                         await updatePatientMedicalData(selectedPatient, { transfusionHistory: newHistory, currentHb: parseFloat(hb) });
                         alert('Vital recorded and history updated.');
                         fetchPatientDetails(selectedPatient); fetchDashboardData();
                       }} className="btn-primary py-3">Commit Record</button>
                    </div>
                 </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
