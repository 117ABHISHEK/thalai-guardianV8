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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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

  const isActive = (path) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

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
            <span className="text-lg sm:text-xl font-display font-black text-slate-900 tracking-tight hidden sm:block">
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
                    onClick={() => { setIsNotificationOpen(!isNotificationOpen); setIsMobileMenuOpen(false); setIsProfileOpen(false); }}
                    className={`p-2.5 rounded-xl transition-all relative ${isNotificationOpen ? 'text-sky-500 bg-sky-50' : 'text-slate-400 hover:text-sky-500 hover:bg-sky-50'}`}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                  </button>

                  {isNotificationOpen && (
                    <div className="hidden md:block">
                      <div className="fixed inset-0 z-[9998]" onClick={() => setIsNotificationOpen(false)} />
                      <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  {/* Click-outside backdrop */}
                  {isProfileOpen && (
                    <div className="fixed inset-0 z-[9998]" onClick={() => setIsProfileOpen(false)} />
                  )}

                  <button
                    onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationOpen(false); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 p-1.5 pr-4 border rounded-2xl transition-all ${
                      isProfileOpen
                        ? 'bg-white border-sky-200 shadow-md shadow-sky-500/10'
                        : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-sky-200'
                    }`}
                  >
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

                  {/* Click-triggered Dropdown */}
                  <div
                    className={`absolute right-0 top-full mt-2 w-56 bg-white rounded-[24px] shadow-2xl border border-slate-100 p-2.5 transition-all duration-200 z-[9999] ${
                      isProfileOpen
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 translate-y-3 pointer-events-none'
                    }`}
                  >
                    <div className="px-4 py-3 border-b border-slate-50 mb-1">
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Session Identity</p>
                       <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                    </div>
                    <button onClick={() => { navigate(`/${user.role}-dashboard`); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all">
                      <LayoutDashboard className="w-4 h-4" /> My Dashboard
                    </button>
                    <button onClick={() => { navigate('/account-settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all">
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

      {/* Global Notification Dropdown for Mobile/Tablet */}
      {isNotificationOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-[1001] bg-slate-900/20 backdrop-blur-[2px]" onClick={() => setIsNotificationOpen(false)} />
          <div className="fixed top-20 right-4 left-4 z-[1002] animate-slide-up origin-top">
            <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
          </div>
        </div>
      )}

      {/* Premium Mobile Overlay Menu */}
      <div className={`fixed inset-0 z-[1000] md:hidden transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop glass */}
        <div className="absolute inset-0 bg-white/95 backdrop-blur-2xl" onClick={() => setIsMobileMenuOpen(false)} />
        
        {/* Menu Content */}
        <div className={`absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl transition-transform duration-500 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <div className="flex flex-col h-full bg-slate-50/50">
              <div className="p-6 flex items-center justify-between border-b border-slate-100 bg-white">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-500 rounded-xl shadow-lg shadow-sky-500/20">
                      <Droplets className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-display font-black text-slate-900">Guardian <span className="text-sky-500">Menu</span></span>
                 </div>
                 <button 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 active:scale-90 transition-all font-bold"
                 >
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="flex-grow overflow-y-auto px-6 py-8 space-y-6">
                 {/* User Profile Header in Mobile Menu */}
                 {isAuthenticated && user && (
                   <div className="card-premium p-6 !bg-slate-900 !text-white border-0 overflow-hidden relative group animate-reveal">
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                      <div className="relative z-10 flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-0.5 overflow-hidden">
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-sky-500 text-white font-black text-xl">
                                {user.name?.charAt(0)}
                              </div>
                            )}
                         </div>
                         <div className="flex-1">
                            <p className="text-xs font-black text-sky-400 uppercase tracking-widest mb-1">Authenticated {user.role}</p>
                            <h4 className="text-lg font-black tracking-tight truncate">{user.name}</h4>
                         </div>
                      </div>
                      <div className="mt-6 flex gap-2">
                        <button 
                          onClick={() => { navigate('/account-settings'); setIsMobileMenuOpen(false); }}
                          className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all"
                        >
                          Modify Space
                        </button>
                        <button 
                          onClick={handleLogout}
                          className="flex-1 py-2.5 bg-rose-500/80 hover:bg-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Sign Out
                        </button>
                      </div>
                   </div>
                 )}

                 {/* Navigation Links */}
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-4">Registry Access</p>
                    {navLinks.map((link, idx) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-5 px-6 py-4 rounded-3xl text-lg font-bold transition-all animate-reveal`}
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div className={`p-2.5 rounded-2xl transition-all ${
                          isActive(link.path) 
                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' 
                            : 'bg-white shadow-sm text-slate-400 group-hover:text-sky-500'
                        }`}>
                           <link.icon className="w-5 h-5" />
                        </div>
                        <span className={isActive(link.path) ? 'text-sky-600' : 'text-slate-600'}>{link.name}</span>
                        {isActive(link.path) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_10px_#0ea5e9]" />}
                      </Link>
                    ))}
                 </div>
                 
                 {!isAuthenticated && (
                   <div className="pt-8 border-t border-slate-100 flex flex-col gap-4 animate-reveal" style={{ animationDelay: '300ms' }}>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-4">Onboarding</p>
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn-secondary w-full py-4 text-base shadow-lg shadow-slate-200/50">
                        <LogIn className="w-4 h-4" /> Sign In
                      </Link>
                      <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary w-full py-4 text-base">
                        <UserPlus className="w-4 h-4" /> Join Initiative
                      </Link>
                   </div>
                 )}
              </div>
              
              <div className="p-8 bg-white border-t border-slate-100">
                 <div className="flex items-center gap-4 animate-reveal" style={{ animationDelay: '500ms' }}>
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100">
                       <Heart className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" />
                    </div>
                    <div>
                       <p className="text-xs font-black text-slate-900">Life-Saving Protocol v8.0</p>
                       <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest transition-all hover:tracking-[0.2em] cursor-default">
                          Verified & Encrypted
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      {/* End Mobile Overlay */}
    </nav>
  );
};

export default Navbar;
