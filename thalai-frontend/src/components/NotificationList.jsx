import { useState, useEffect } from 'react';
import api from '../api/auth';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const getIcon = (type) => {
    if (type.startsWith('appointment')) return '📅';
    if (type.startsWith('connection')) return '🤝';
    if (type === 'donor_match') return '🩸';
    if (type === 'checkup_suggested') return '🏥';
    if (type === 'urgent_request') return '🚨';
    return '🔔';
  };

  if (loading) return <div className="text-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-blue mx-auto"></div></div>;

  return (
    <div className="space-y-4">
      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
           <p className="text-gray-500">No notifications yet.</p>
        </div>
      ) : (
        notifications.map(n => (
          <div 
            key={n._id} 
            onClick={() => !n.isRead && markAsRead(n._id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              n.isRead ? 'bg-white border-gray-100 opacity-75' : 'bg-blue-50/50 border-blue-100 shadow-sm ring-1 ring-blue-200'
            }`}
          >
            {!n.isRead && (
              <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-bl-lg"></div>
            )}
            <div className="flex gap-4">
              <div className="text-2xl flex-shrink-0 bg-white w-12 h-12 rounded-xl shadow-sm flex items-center justify-center border border-gray-50">
                {getIcon(n.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`font-bold text-sm ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h4>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${n.isRead ? 'text-gray-500' : 'text-gray-600 font-medium'}`}>
                  {n.message}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NotificationList;
