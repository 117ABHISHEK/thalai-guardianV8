import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../api/auth';
import { 
  Calendar, Clock, User, Activity, 
  CheckCircle2, AlertCircle, X, 
  MoreHorizontal, MoreVertical, ChevronRight, MessageSquare,
  RefreshCw, CheckCircle, Info, Share2, FileText, Download
} from 'lucide-react';

const AppointmentList = ({ role }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scheduleData, setScheduleData] = useState({ date: '', time: '', notes: '', status: 'scheduled' });
  const [bookingData, setBookingData] = useState({ doctorId: '', date: '', time: '', reason: '' });
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAppointments();
    if (role === 'donor' || role === 'patient') {
      fetchDoctors();
    }
  }, [role]);

  useEffect(() => {
    if (showBookModal || showScheduleModal || showInfoModal) {
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
  }, [showBookModal, showScheduleModal, showInfoModal]);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/public/doctors');
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      let endpoint = '/appointments/my';
      if (role === 'doctor') endpoint = '/appointments/doctor';
      if (role === 'admin') endpoint = '/appointments/all';
      
      const response = await api.get(endpoint);
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch synchronization schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      setUpdating(true);
      await api.patch(`/appointments/${id}`, { status });
      fetchAppointments();
    } catch (error) {
      alert(error.response?.data?.message || 'Update failed.');
    } finally {
      setUpdating(false);
    }
  };

  const openScheduleModal = (apt) => {
    setSelectedApt(apt);
    setScheduleData({
      date: apt.date ? new Date(apt.date).toISOString().split('T')[0] : '',
      time: apt.time || '',
      notes: apt.notes || '',
      status: 'scheduled'
    });
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUpdating(true);
    try {
      await api.patch(`/appointments/${selectedApt._id}`, scheduleData);
      setShowScheduleModal(false);
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Schedule synchronization failed.');
    } finally {
      setUpdating(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setUpdating(true);
    try {
      await api.post('/appointments', bookingData);
      setSuccessMessage('Appointment booked successfully! The doctor will confirm your slot shortly.');
      setBookingData({ doctorId: '', date: '', time: '', reason: '' });
      fetchAppointments();
      // Close modal after 1.5s so user can read the success message
      setTimeout(() => {
        setShowBookModal(false);
        setSuccessMessage('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Appointment booking failed. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleShareLink = (aptId) => {
    const link = `${window.location.origin}/sync/${aptId}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Clinical synchronization link copied to clipboard.');
    }).catch(err => {
      console.error('Failed to copy link:', err);
    });
  };

  const handleDownloadReport = (apt) => {
    const reportData = {
      instanceId: apt._id,
      patient: apt.user?.name,
      practitioner: apt.doctor?.name,
      specialization: apt.doctor?.specialization,
      scheduledDate: new Date(apt.date).toLocaleDateString(),
      scheduledTime: apt.time,
      status: apt.status,
      registryNotes: apt.notes || 'No clinical notes provided.'
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thalai-report-${apt._id.slice(-6)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusStyle = (status) => {
    const styles = {
      scheduled: 'bg-sky-500/10 text-sky-600 border-sky-100',
      completed_pending: 'bg-amber-500/10 text-amber-600 border-amber-100',
      completed: 'bg-emerald-500/10 text-emerald-600 border-emerald-100',
      cancelled: 'bg-slate-500/10 text-slate-400 border-slate-100',
      pending: 'bg-indigo-500/10 text-indigo-600 border-indigo-100',
    };
    return styles[status] || styles.pending;
  };

  if (loading) return (
    <div className="py-20 text-center">
       <div className="w-10 h-10 border-4 border-sky-500/10 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Accessing Schedule...</p>
    </div>
  );

  return (
    <div className="animate-reveal">
      {/* Book Appointment Button for Donors and Patients */}
      {(role === 'donor' || role === 'patient') && (
        <div className="mb-8">
          <button 
            onClick={() => setShowBookModal(true)}
            className="btn-primary w-full py-5 text-sm font-black uppercase tracking-widest shadow-xl shadow-sky-500/10 flex items-center justify-center gap-3 group"
          >
            <Calendar className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Book New Appointment with Doctor
          </button>
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="py-20 text-center card-premium bg-slate-50/50 border-dashed border-2">
           <Calendar className="w-16 h-16 text-slate-200 mx-auto mb-4" />
           <p className="text-slate-400 font-bold">No synchronization cycles scheduled.</p>
           <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-2 font-black">Book a consultation to start</p>
        </div>
      ) : (
        <div className="space-y-4 overflow-x-auto md:overflow-visible pb-4 no-scrollbar">
           {appointments.map((apt) => (
              <div key={apt._id} className={`card-premium group hover:shadow-2xl hover:shadow-slate-200/50 transition-all border border-slate-100 bg-white p-6 relative min-w-[320px] md:min-w-0 ${activeDropdown === apt._id ? 'z-50' : 'z-0'}`}>
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                       {/* Date Block */}
                       <div className="w-20 bg-slate-50 border border-slate-100 rounded-2xl p-2 text-center flex flex-col items-center justify-center">
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-tight leading-none mb-1">
                             {apt.date ? new Date(apt.date).toLocaleDateString(undefined, { month: 'short' }) : '---'}
                          </span>
                          <span className="text-2xl font-black text-slate-900 leading-none">
                             {apt.date ? new Date(apt.date).getDate() : '--'}
                          </span>
                          <span className="text-[10px] font-bold text-sky-500 mt-1 uppercase tracking-widest">
                             {apt.time || '--:--'}
                          </span>
                       </div>

                       {/* Participant Info */}
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                             {role === 'doctor' ? 'Clinical Requester' : (role === 'admin' ? 'Participants' : 'Specialist')}
                          </p>
                          <h4 className="text-lg font-display font-black text-slate-900 leading-none flex items-center gap-2">
                             {role === 'doctor' ? apt.user?.name : (role === 'admin' ? `${apt.user?.name} ↔ Dr. ${apt.doctor?.name}` : `Dr. ${apt.doctor?.name}`)}
                             <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${getStatusStyle(apt.status)}`}>
                                {apt.status === 'completed_pending' ? 'Verification Sent' : apt.status}
                             </span>
                          </h4>
                          <div className="flex items-center gap-3 mt-3">
                             <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                <Activity className="w-3 h-3" /> {apt.reason || 'General Consult'}
                             </span>
                             {role === 'doctor' && (
                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                             )}
                             {role === 'doctor' && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                                   Group: {apt.user?.bloodGroup}
                                </span>
                             )}
                          </div>
                       </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 md:border-l md:border-slate-100 md:pl-6">
                       {role === 'doctor' && apt.status === 'pending' && (
                          <button onClick={() => openScheduleModal(apt)} disabled={updating} className="btn-primary py-3 px-6 text-[10px] font-black uppercase">
                             Set Schedule
                          </button>
                       )}
                       {role === 'doctor' && apt.status === 'scheduled' && (
                          <button onClick={() => handleStatusUpdate(apt._id, 'completed_pending')} disabled={updating} className="py-3 px-6 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-2xl text-[10px] font-black uppercase border border-indigo-100 transition-all">
                             Mark Completed
                          </button>
                       )}
                       {role !== 'doctor' && apt.status === 'completed_pending' && (
                          <button onClick={() => handleStatusUpdate(apt._id, 'completed')} disabled={updating} className="py-3 px-6 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">
                             Confirm Session
                          </button>
                       )}
                       {apt.status !== 'cancelled' && apt.status !== 'completed' && apt.status !== 'completed_pending' && (
                          <button onClick={() => handleStatusUpdate(apt._id, 'cancelled')} disabled={updating} className="p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                             <X className="w-5 h-5" />
                          </button>
                       )}
                       
                       <div className="relative">
                          <button 
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === apt._id ? null : apt._id); }}
                          className={`p-2 rounded-xl transition-all ${activeDropdown === apt._id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                        >
                           <MoreVertical className="w-6 h-6" />
                        </button>

                          {activeDropdown === apt._id && (
                            <>
                              <div className="fixed inset-0 z-[9998]" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} />
                              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2.5 z-[9999] animate-reveal">
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); setSelectedApt(apt); setShowInfoModal(true); setActiveDropdown(null); }}
                                   className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                 >
                                    <Info className="w-4 h-4" /> View Full Details
                                 </button>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleShareLink(apt._id); setActiveDropdown(null); }}
                                   className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                 >
                                    <Share2 className="w-4 h-4" /> Share Sync Link
                                 </button>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleDownloadReport(apt); setActiveDropdown(null); }}
                                   className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                                 >
                                    <FileText className="w-4 h-4" /> Generate Case Report
                                 </button>
                                 {role === 'admin' && (
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); handleStatusUpdate(apt._id, 'cancelled'); setActiveDropdown(null); }}
                                     className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all"
                                   >
                                      <AlertCircle className="w-4 h-4" /> Admin Override: Cancel
                                   </button>
                                 )}
                                 <div className="h-[1px] bg-slate-50 my-1.5 mx-2" />
                                 <p className="px-4 py-1 text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">ID: {apt._id.slice(-12)}</p>
                              </div>
                            </>
                          )}
                       </div>
                    </div>
                 </div>
                 
                 {apt.notes && (
                   <div className="mt-4 pt-4 border-t border-slate-50 flex gap-3 items-start group-hover:bg-slate-50/50 rounded-xl transition-colors">
                      <MessageSquare className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                         Registry Notes: {apt.notes}
                      </p>
                   </div>
                 )}
              </div>
           ))}
        </div>
      )}

      {/* Schedule Sync Modal */}
      {showScheduleModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-white/20">
            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-2xl font-display font-black text-slate-900">Sync Schedule</h3>
                 <button onClick={() => setShowScheduleModal(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <p className="text-xs font-bold text-slate-500">Clinical session for {selectedApt?.user?.name}</p>
            </div>
            
            <form onSubmit={handleScheduleSubmit} className="p-8 space-y-6">
              {error && <div className="p-4 bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest rounded-2xl border border-rose-100">{error}</div>}
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="input-label text-[10px]">Registry Date</label>
                  <input 
                    type="date" required value={scheduleData.date}
                    onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                    className="input-field py-3 text-sm bg-slate-50" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="input-label text-[10px]">Sync Time</label>
                  <input 
                    type="time" required value={scheduleData.time}
                    onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                    className="input-field py-3 text-sm bg-slate-50" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="input-label text-[10px]">Practitioner Instructions</label>
                <textarea 
                  rows="3" placeholder="Clinical preparation notes..."
                  value={scheduleData.notes}
                  onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                  className="input-field bg-slate-50 resize-none text-sm" 
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" disabled={updating}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-white bg-sky-500 rounded-2xl hover:bg-sky-600 shadow-xl shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {updating ? 'Synchronizing...' : 'Initialize Schedule Sync'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Instance Info Modal */}
      {showInfoModal && selectedApt && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up border border-white/20">
              <div className="p-8 bg-slate-900 text-white relative">
                 <button onClick={() => setShowInfoModal(false)} className="absolute top-6 right-6 p-2 text-white/40 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                 <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center">
                       <Activity className="w-6 h-6" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Instance Details</p>
                       <h3 className="text-xl font-display font-black">Sync Cycle #{selectedApt._id.slice(-6)}</h3>
                    </div>
                 </div>
              </div>

              <div className="p-10 space-y-10">
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Participant A</p>
                       <p className="font-bold text-slate-900">{selectedApt.user?.name}</p>
                       <p className="text-xs text-slate-400">{selectedApt.user?.email}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Medical Specialist</p>
                       <p className="font-bold text-slate-900">Dr. {selectedApt.doctor?.name}</p>
                       <p className="text-xs text-slate-400">{selectedApt.doctor?.specialization || 'Clinical Expert'}</p>
                    </div>
                 </div>

                 <div className="p-6 bg-slate-50 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-sky-500" />
                          <p className="text-sm font-bold text-slate-700">{selectedApt.date ? new Date(selectedApt.date).toLocaleDateString(undefined, { dateStyle: 'full' }) : 'No date set'}</p>
                       </div>
                       <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-sky-500" />
                          <p className="text-sm font-bold text-slate-700">{selectedApt.time}</p>
                       </div>
                    </div>
                    <div className="h-[1px] bg-slate-200" />
                    <div className="flex items-center gap-3">
                       <CheckCircle className="w-4 h-4 text-emerald-500" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Protocol: <span className="text-slate-900">{selectedApt.status}</span></p>
                    </div>
                 </div>

                 {selectedApt.notes && (
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <MessageSquare className="w-3 h-3" /> Clinical Instructions
                      </p>
                      <p className="text-sm text-slate-600 bg-slate-50 p-6 rounded-[24px] italic leading-relaxed font-medium">
                         "{selectedApt.notes}"
                      </p>
                   </div>
                 )}

                  <button onClick={() => setShowInfoModal(false)} className="w-full btn-primary py-4 mt-4">
                    Close Instance
                  </button>
               </div>
            </div>
         </div>,
         document.body
      )}

      {/* Book Appointment Modal for Donors */}
      {showBookModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in" style={{ margin: 0 }}>
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up border border-white/20">
            <div className="p-8 border-b border-slate-100 bg-slate-900 text-white flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1">Medical Consultation</p>
                  <h3 className="text-2xl font-display font-black">Book Appointment</h3>
                </div>
                <button onClick={() => setShowBookModal(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleBookAppointment} className="flex-1 overflow-y-auto p-8 pb-20 space-y-6">
              {error && (
                <div className="p-4 bg-rose-50 text-rose-600 text-xs font-black uppercase tracking-widest rounded-2xl border border-rose-100 flex items-start gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}
              {successMessage && (
                <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-black tracking-wide rounded-2xl border border-emerald-100 flex items-start gap-2">
                  <span>✅</span> {successMessage}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="input-label">Select Doctor</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  <select
                    value={bookingData.doctorId}
                    onChange={(e) => setBookingData({ ...bookingData, doctorId: e.target.value })}
                    className="input-field pl-12 cursor-pointer appearance-none bg-white"
                    required
                  >
                    <option value="">Choose a Specialist</option>
                    {doctors.map((doc) => (
                      <option key={doc._id || doc.id} value={doc._id || doc.id}>
                        Dr. {doc.name} — {doc.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="input-label">Preferred Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                    <input
                      type="date"
                      value={bookingData.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      className="input-field pl-12 bg-white"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="input-label">Preferred Time</label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                    <input
                      type="time"
                      value={bookingData.time}
                      onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      className="input-field pl-12 bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="input-label">Reason for Consultation</label>
                <div className="relative group">
                  <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                  <textarea
                    value={bookingData.reason}
                    onChange={(e) => setBookingData({ ...bookingData, reason: e.target.value })}
                    rows="4"
                    className="input-field pl-12 pt-4 bg-white resize-none"
                    placeholder="Describe your consultation objective..."
                    required
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-4 text-sm font-black uppercase tracking-widest text-white bg-sky-500 rounded-2xl hover:bg-sky-600 shadow-xl shadow-sky-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {updating ? 'Booking...' : 'Confirm Appointment'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-600 bg-slate-100 rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AppointmentList;
