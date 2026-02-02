import { useState, useEffect } from 'react';
import api from '../api/auth';
import { Calendar, Handshake, Droplets, Hospital, AlertCircle, Bell, MoreHorizontal, Trash2, CheckCircle } from 'lucide-react';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data.notifications);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      setActiveDropdown(null);
    } catch (err) {
      alert('Failed to delete notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const getIcon = (type) => {
    const className = "w-6 h-6 text-sky-500";
    if (type.startsWith('appointment')) return <Calendar className={className} />;
    if (type.startsWith('connection')) return <Handshake className={className} />;
    if (type === 'donor_match') return <Droplets className={className} />;
    if (type === 'checkup_suggested') return <Hospital className={className} />;
    if (type === 'urgent_request') return <AlertCircle className={className} />;
    return <Bell className={className} />;
  };

  if (loading) return <div className="text-center p-24"><div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin mx-auto"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent Activity Logs</p>
         <button onClick={markAllAsRead} className="text-[10px] font-black text-sky-500 uppercase tracking-widest hover:text-sky-600 transition-colors">Clear Undue Alerts</button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
           <Bell className="w-10 h-10 text-slate-200 mx-auto mb-4" />
           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No signals detected.</p>
        </div>
      ) : (
        notifications.map(n => (
          <div 
            key={n._id} 
            onClick={() => !n.isRead && markAsRead(n._id)}
            className={`p-6 rounded-[32px] border transition-all cursor-pointer relative overflow-visible ${
              n.isRead ? 'bg-white border-slate-100 opacity-60' : 'bg-white border-sky-100 shadow-xl shadow-sky-500/5'
            }`}
          >
            {!n.isRead && (
              <div className="absolute top-0 right-10 w-4 h-1 bg-sky-500 rounded-b-full"></div>
            )}
            
            <div className="absolute top-6 right-6">
               <button 
                 onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === n._id ? null : n._id); }}
                 className="p-2 text-slate-300 hover:text-slate-600 transition-colors rounded-xl hover:bg-slate-50"
               >
                  <MoreHorizontal className="w-5 h-5" />
               </button>
               {activeDropdown === n._id && (
                  <>
                     <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                     <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2 z-50 animate-reveal text-left">
                        <button 
                          onClick={() => markAsRead(n._id)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all"
                        >
                           <CheckCircle className="w-4 h-4" /> Finalize Signal
                        </button>
                        <div className="h-[1px] bg-slate-50 my-2 mx-2" />
                        <button 
                          onClick={() => deleteNotification(n._id)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all"
                        >
                           <Trash2 className="w-4 h-4" /> Purge Log
                        </button>
                     </div>
                  </>
               )}
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-white transition-all">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 pr-10">
                <div className="flex justify-between items-start mb-2">
                  <h4 className={`font-display font-black text-sm tracking-tight ${n.isRead ? 'text-slate-700' : 'text-slate-900 line-clamp-1'}`}>{n.title}</h4>
                </div>
                <p className={`text-xs leading-relaxed ${n.isRead ? 'text-slate-500' : 'text-slate-600 font-medium'}`}>
                  {n.message}
                </p>
                <div className="mt-3 flex items-center gap-2">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                     {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                   </span>
                   {!n.isRead && <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse"></span>}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationList;
