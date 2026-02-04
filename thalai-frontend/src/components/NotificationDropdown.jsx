import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Calendar, Handshake, Droplets, Hospital, AlertCircle, X, CheckCircle, Trash2, MoreHorizontal } from 'lucide-react';
import { getNotifications, markAsRead } from '../api/notifications';

const NotificationDropdown = ({ onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications({ limit: 5 });
      setNotifications(response.data.notifications);
    } catch (err) {
      console.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (e, id) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, isRead: true } : n
      ));
      // Dispatch event to update navbar count
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const getIcon = (type) => {
    const className = "w-4 h-4 text-sky-500";
    if (type.startsWith('appointment')) return <Calendar className={className} />;
    if (type.startsWith('connection')) return <Handshake className={className} />;
    if (type === 'donor_match') return <Droplets className={className} />;
    if (type === 'checkup_suggested') return <Hospital className={className} />;
    if (type === 'urgent_request') return <AlertCircle className={className} />;
    return <Bell className={className} />;
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden z-[9999] animate-reveal">
      <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <Bell className="w-4 h-4 text-sky-500" /> Neural Signals
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-md transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scanning Network...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-8 h-8 text-slate-100 mx-auto mb-3" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active Signals</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {notifications.map((n) => (
              <div 
                key={n._id} 
                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group relative ${!n.isRead ? 'bg-sky-50/30' : ''}`}
                onClick={(e) => !n.isRead && handleMarkAsRead(e, n._id)}
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.isRead ? 'bg-white shadow-sm' : 'bg-slate-50'}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className={`text-xs font-bold truncate ${!n.isRead ? 'text-slate-900' : 'text-slate-500'}`}>
                        {n.title}
                      </h4>
                      {!n.isRead && <span className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0 mt-1 shadow-sm shadow-sky-500/50 animate-pulse"></span>}
                    </div>
                    <p className={`text-[10px] leading-relaxed mb-1.5 ${!n.isRead ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                      {n.message}
                    </p>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      {new Date(n.createdAt).toLocaleDateString()} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-center">
        <Link 
          to={`/${user?.role}-dashboard?tab=notifications`} 
          onClick={onClose}
          className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em] hover:text-sky-600 transition-all flex items-center gap-2"
        >
          Access Signal History <MoreHorizontal className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
