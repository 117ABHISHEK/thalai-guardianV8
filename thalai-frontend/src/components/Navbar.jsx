import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Droplets, LayoutDashboard, UserCircle, 
  LogOut, Bell, Settings, Menu, X,
  UserCheck, ClipboardList, Activity, Heart,
  LogIn, UserPlus, Search, Calendar
} from 'lucide-react';
import { useState, useEffect } from 'react';
import NotificationDropdown from './NotificationDropdown';
import { getNotifications } from '../api/notifications';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      
      const interval = setInterval(fetchUnreadCount, 30000); // 30s refresh
      
      // Listen for manual updates from other components
      window.addEventListener('notificationsUpdated', fetchUnreadCount);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('notificationsUpdated', fetchUnreadCount);
      };
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await getNotifications({ status: 'unread', limit: 1 });
      setUnreadCount(response.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch unread count');
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Don't show generic navbar on split-screen auth pages if desired, 
  // but usually it's better to show it or a simplified version.
  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname.startsWith('/register/')) {
    return null;
  }

  const baseNavLinks = {
    patient: [
      { name: 'Dashboard', path: '/patient-dashboard', icon: LayoutDashboard },
      { name: 'Reports', path: '/patient-dashboard?tab=health', icon: Activity },
      { name: 'Requests', path: '/patient-dashboard?tab=history', icon: ClipboardList },
    ],
    donor: [
      { name: 'Dashboard', path: '/donor-dashboard', icon: LayoutDashboard },
      { name: 'Matches', path: '/donor-dashboard?tab=matches', icon: Heart },
      { name: 'Profile', path: '/donor-profile', icon: UserCircle },
    ],
    doctor: [
      { name: 'Dashboard', path: '/doctor-dashboard', icon: LayoutDashboard },
      { name: 'Appointments', path: '/doctor-dashboard?tab=appointments', icon: ClipboardList },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
      { name: 'Donors', path: '/admin/donor-verification', icon: UserCheck },
    ],
  };

  const navLinks = isAuthenticated && user ? baseNavLinks[user.role] || [] : [
    { name: 'Home', path: '/', icon: Heart },
    { name: 'Find Donors', path: '/donors', icon: Search },
    { name: 'View Requests', path: '/requests', icon: ClipboardList },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 font-body transition-all">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <div className="p-2 sm:p-2.5 bg-sky-500 rounded-2xl shadow-lg shadow-sky-500/30">
              <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-display font-black text-slate-900 tracking-tight hidden xs:block">
              Thal<span className="text-sky-500">AI</span> Guardian
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isActive(link.path)
                    ? 'bg-sky-50 text-sky-600 shadow-sm shadow-sky-500/10'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Section (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-100">
                <div className="relative">
                  <button 
                    onClick={() => { setIsNotificationOpen(!isNotificationOpen); setIsMobileMenuOpen(false); }}
                    className={`p-2.5 rounded-xl transition-all relative ${isNotificationOpen ? 'text-sky-500 bg-sky-50' : 'text-slate-400 hover:text-sky-500 hover:bg-sky-50'}`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                  </button>

                  {isNotificationOpen && (
                    <>
                      <div className="fixed inset-0 z-[9998]" onClick={() => setIsNotificationOpen(false)} />
                      <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
                    </>
                  )}
                </div>
                
                <div className="relative group">
                  <button className="flex items-center gap-3 p-1.5 pr-4 bg-slate-50 border border-slate-100 rounded-2xl group-hover:bg-white group-hover:border-sky-200 transition-all">
                    <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 overflow-hidden">
                       {user.profilePicture ? (
                         <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                       ) : (
                         <UserCircle className="w-6 h-6" />
                       )}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-black text-slate-900 leading-none mb-1">{user?.name?.split(' ')[0] || 'User'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{user.role}</p>
                    </div>
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2.5 opacity-0 translate-y-3 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-[9999]">
                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Session Identity</p>
                       <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                    </div>
                    <button onClick={() => navigate(`/${user.role}-dashboard`)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all">
                      <LayoutDashboard className="w-4 h-4" /> My Dashboard
                    </button>
                    <button onClick={() => navigate('/account-settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all">
                      <Settings className="w-4 h-4" /> Account Settings
                    </button>
                    <div className="h-[1px] bg-slate-50 my-1.5 mx-2" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all">
                      <LogOut className="w-4 h-4" /> Terminate Session
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-4 lg:px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-sky-600 transition-colors flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Login
                </Link>
                <Link to="/register" className="btn-primary min-w-[120px] text-sm py-2.5">
                  <UserPlus className="w-4 h-4" /> Join Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Actions */}
          <div className="md:hidden flex items-center gap-3">
             {isAuthenticated && (
                <button 
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 text-slate-500 hover:text-sky-500 transition-all"
                >
                  <Bell className="w-6 h-6" />
                </button>
             )}
             <button 
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
               className="p-2.5 text-slate-800 bg-slate-100 rounded-2xl active:scale-90 transition-all"
             >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
          </div>
        </div>
      </div>

      {/* Improved Mobile Overlay Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[1000] bg-white animate-reveal">
           <div className="flex flex-col h-full">
              <div className="container-custom h-16 flex items-center justify-between border-b border-slate-50">
                 <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-sky-500 rounded-xl">
                      <Droplets className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-display font-black text-slate-900">Guardian Menu</span>
                 </div>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 bg-slate-50 rounded-xl">
                    <X className="w-6 h-6 text-slate-600" />
                 </button>
              </div>
              
              <div className="flex-grow overflow-y-auto px-6 py-10 space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-4">Navigation</p>
                 {navLinks.map((link) => (
                   <Link
                     key={link.path}
                     to={link.path}
                     onClick={() => setIsMobileMenuOpen(false)}
                     className={`flex items-center gap-5 px-6 py-4 rounded-3xl text-xl font-bold transition-all ${
                       isActive(link.path)
                         ? 'bg-sky-50 text-sky-600'
                         : 'text-slate-600 hover:bg-slate-50'
                     }`}
                   >
                     <div className={`p-2 rounded-xl ${isActive(link.path) ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                        <link.icon className="w-6 h-6" />
                     </div>
                     {link.name}
                   </Link>
                 ))}
                 
                 {isAuthenticated && (
                   <div className="pt-8 mt-8 border-t border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-4">User Preferences</p>
                      <div className="grid grid-cols-2 gap-4">
                         <button onClick={() => { navigate('/account-settings'); setIsMobileMenuOpen(false); }} className="flex flex-col items-center gap-3 p-6 rounded-[32px] bg-slate-50 text-slate-600 font-bold">
                            <Settings className="w-8 h-8" />
                            <span className="text-xs">Settings</span>
                         </button>
                         <button onClick={handleLogout} className="flex flex-col items-center gap-3 p-6 rounded-[32px] bg-rose-50 text-rose-600 font-bold">
                            <LogOut className="w-8 h-8" />
                            <span className="text-xs">Logout</span>
                         </button>
                      </div>
                   </div>
                 )}
                 
                 {!isAuthenticated && (
                   <div className="pt-10 flex flex-col gap-4">
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-secondary w-full py-5 text-xl">Login</Link>
                      <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary w-full py-5 text-xl">Join the Mission</Link>
                   </div>
                 )}
              </div>
              
              <div className="p-8 border-t border-slate-50 bg-slate-50/50">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                       <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
                    </div>
                    <div>
                       <p className="text-xs font-black text-slate-900">Saving Lives Daily</p>
                       <p className="text-[10px] font-bold text-slate-400">Version 8.0.2 Stable</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
