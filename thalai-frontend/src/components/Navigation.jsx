import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Droplets, LayoutDashboard, UserCircle, 
  LogOut, Bell, Settings, Menu, X,
  UserCheck, ClipboardList, Activity
} from 'lucide-react';
import { useState } from 'react';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (location.pathname === '/login' || location.pathname === '/register' || location.pathname.startsWith('/register/')) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  const baseNavLinks = {
    patient: [
      { name: 'Dashboard', path: '/patient-dashboard', icon: LayoutDashboard },
      { name: 'My Requests', path: '/patient-dashboard?tab=history', icon: ClipboardList },
      { name: 'Predictions', path: '/patient-dashboard?tab=predictions', icon: Activity },
    ],
    donor: [
      { name: 'Dashboard', path: '/donor-dashboard', icon: LayoutDashboard },
      { name: 'Match Requests', path: '/donor-dashboard?tab=matches', icon: HeartPulse },
      { name: 'Eligibility', path: '/donor-profile', icon: UserCheck },
    ],
    doctor: [
      { name: 'Dashboard', path: '/doctor-dashboard', icon: LayoutDashboard },
      { name: 'Patients', path: '/doctor-dashboard?tab=patients', icon: Activity },
      { name: 'Appointments', path: '/doctor-dashboard?tab=appointments', icon: ClipboardList },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin-dashboard', icon: LayoutDashboard },
      { name: 'Donors', path: '/admin/donor-verification', icon: UserCheck },
      { name: 'Requests', path: '/admin/requests', icon: ClipboardList },
    ],
  };

  const navLinks = baseNavLinks[user.role] || [];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-100 font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={`/${user.role}-dashboard`} className="flex items-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <div className="p-2.5 bg-sky-500 rounded-2xl shadow-lg shadow-sky-500/30">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-black text-slate-900 tracking-tight">
                Thal<span className="text-sky-500">AI</span> Guardian
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
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

          {/* User Controls */}
          <div className="hidden md:flex items-center gap-4">
            <button className="p-2.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-8 w-[1px] bg-slate-100 mx-2" />
            
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
              </div>
              <div className="relative group">
                <button className="w-10 h-10 rounded-2xl bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-500 group-hover:border-sky-500 group-hover:text-sky-500 transition-all overflow-hidden">
                   <UserCircle className="w-7 h-7" />
                </button>
                {/* Simple Dropdown Simulator */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all">
                  <button onClick={() => navigate('/profile')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all">
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 text-slate-600 hover:bg-slate-50 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-6 space-y-2 animate-reveal">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-bold transition-all ${
                isActive(link.path)
                  ? 'bg-sky-50 text-sky-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {link.icon && <link.icon className="w-5 h-5" />}
              {link.name}
            </Link>
          ))}
          <div className="pt-4 mt-4 border-t border-slate-50">
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-base font-bold text-rose-600 hover:bg-rose-50 transition-all">
               <LogOut className="w-5 h-5" /> Logout
             </button>
          </div>
        </div>
      )}
    </nav>
  );
};

// Placeholder for HeartPulse if not imported correctly
const HeartPulse = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>
  </svg>
);

export default Navigation;
