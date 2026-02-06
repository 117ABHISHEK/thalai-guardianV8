import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStats } from '../api/admin';
import StatsCharts from '../components/StatsCharts';
import StatCard from '../components/StatCard';
import AppointmentList from '../components/AppointmentList';
import AIStatusWidget from '../components/AIStatusWidget';
import { 
  Users, Droplets, CheckCircle, Clock, Check, BarChart, 
  UserCheck, ClipboardList, RefreshCw, LayoutGrid,
  ShieldCheck, Activity, PieChart, ArrowUpRight,
  Settings, Database
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getStats();
      setStats(response.data); // Backend returns { success: true, data: { ...stats } }
    } catch (err) {
      setError(err.message || 'Failed to sync central intelligence');
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

  return (
    <div className="min-h-screen bg-transparent font-body pb-64 animate-slide-up">
      {/* Central Command Header */}
      <div className="glass border-b border-slate-100 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-reveal">
              <div>
                 <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                      Admin Command Center
                    </span>
                 </div>
                 <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">
                   Central <span className="text-sky-500">Intelligence</span>
                 </h1>
                 <p className="text-slate-500 font-medium mt-1">Supervising <span className="text-slate-900 font-bold">ThalAI Global Network</span></p>
              </div>

              <div className="flex items-center gap-3">
                 <button onClick={() => navigate('/admin/donor-verification')} className="btn-secondary px-6">
                    <UserCheck className="w-4 h-4" /> Verify Registry
                 </button>
                 <button onClick={() => navigate('/admin/requests')} className="btn-primary px-6">
                    <ClipboardList className="w-4 h-4" /> Operations
                 </button>
              </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="mb-8 animate-reveal">
             <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 flex items-center gap-3">
                <Activity className="w-5 h-5" />
                <span className="font-bold text-sm tracking-tight">{error}</span>
             </div>
          </div>
        )}

        {/* Intelligence Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           <StatCard title="Global Patients" value={stats?.totalPatients || 0} icon={<Users className="w-6 h-6" />} color="blue" subtitle="Total registered receivers" />
           <StatCard title="Hero Database" value={stats?.totalDonors || 0} icon={<Droplets className="w-6 h-6" />} color="red" subtitle="Registered potential donors" />
           <StatCard title="Verified Nodes" value={stats?.verifiedDonors || 0} icon={<ShieldCheck className="w-6 h-6" />} color="green" subtitle="Medical cleared profiles" />
           <StatCard title="Active Flux" value={stats?.pendingRequests || 0} icon={<Activity className="w-6 h-6" />} color="orange" subtitle="Awaiting donor matching" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
           {/* Main Insight Column */}
           <div className="lg:col-span-2 space-y-8">
              <div className="card-premium">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h2 className="text-2xl font-display font-black text-slate-900">Network Telemetry</h2>
                       <p className="text-slate-500 font-medium">Real-time data distribution across the platform</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl text-slate-400">
                       <PieChart className="w-6 h-6" />
                    </div>
                 </div>
                 {stats && <StatsCharts stats={stats} />}
              </div>

              <div className="card-premium">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h2 className="text-2xl font-display font-black text-slate-900">Operations Log</h2>
                       <p className="text-slate-500 font-medium">Recent clinical appointments and matches</p>
                    </div>
                    <button onClick={fetchStats} className="p-3 bg-white border border-slate-100 rounded-2xl hover:text-sky-500 transition-all">
                       <RefreshCw className="w-5 h-5" />
                    </button>
                 </div>
                 <AppointmentList role="admin" />
              </div>
           </div>

           {/* Side Status Column */}
           <div className="space-y-8">
              <div className="card-premium h-fit">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white">
                       <Database className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-display font-black text-slate-900">AI Core Status</h3>
                 </div>
                 <AIStatusWidget />
              </div>

              <div className="card-premium bg-slate-900 text-white overflow-hidden relative group">
                 <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
                    <LayoutGrid className="w-32 h-32" />
                 </div>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Command Actions</p>
                 <div className="space-y-4 relative z-10">
                    {[
                      { label: 'Donor Verification', icon: UserCheck, path: '/admin/donor-verification', color: 'bg-sky-500' },
                      { label: 'Request Management', icon: ClipboardList, path: '/admin/requests', color: 'bg-emerald-500' },
                      { label: 'System Settings', icon: Settings, path: '/admin/settings', color: 'bg-slate-700' }
                    ].map((btn, i) => (
                      <button key={i} onClick={() => navigate(btn.path)} className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group/btn">
                         <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${btn.color} shadow-lg shadow-white/5`}>
                               <btn.icon className="w-5 h-5" />
                            </div>
                            <span className="font-bold">{btn.label}</span>
                         </div>
                         <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover/btn:text-white transition-colors" />
                      </button>
                    ))}
                 </div>
                 <div className="mt-8 pt-8 border-t border-white/10 text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-loose">
                       Platform Intelligence V8.2.0<br/>
                       Current Load: 24% Cloud Compute
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
