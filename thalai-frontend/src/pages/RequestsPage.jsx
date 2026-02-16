import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicRequests } from '../api/public';
import ChartCard from '../components/ChartCard';
import TablePreview from '../components/TablePreview';
import { Activity, ShieldAlert, CheckCircle2, Search, Clock, Droplets, ArrowRight } from 'lucide-react';

const RequestsPage = () => {
  const navigate = useNavigate();
  const [requestData, setRequestData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await getPublicRequests();
      setRequestData(response.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const urgencyColumns = [
    {
      header: 'Requirement',
      key: 'bloodGroup',
      render: (value) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-sm border border-rose-100">
             {value}
          </div>
          <span className="font-bold text-slate-900">Blood Requested</span>
        </div>
      ),
    },
    {
      header: 'Volume',
      key: 'unitsRequired',
      render: (value) => <span className="font-bold text-slate-900">{value} <span className="text-slate-400 font-medium">Units</span></span>
    },
    {
      header: 'Urgency',
      key: 'urgency',
      render: (value) => {
        const styles = {
          critical: 'bg-rose-500 text-white shadow-rose-200',
          high: 'bg-orange-500 text-white shadow-orange-200',
          medium: 'bg-amber-500 text-white shadow-amber-200',
          low: 'bg-emerald-500 text-white shadow-emerald-200',
        };
        return (
          <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md ${styles[value] || styles.medium}`}>
            {value} Priority
          </span>
        );
      },
    },
    {
      header: 'Status',
      key: 'status',
      render: (value) => {
        const configs = {
          pending: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: Clock },
          searching: { color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100', icon: Search },
          completed: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: CheckCircle2 },
        };
        const cfg = configs[value] || configs.pending;
        return (
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
             <cfg.icon className="w-3.5 h-3.5" />
             <span className="text-[10px] font-black uppercase tracking-widest">{value}</span>
          </div>
        );
      },
    },
    {
      header: 'Case Age',
      key: 'createdAt',
      render: (value) => (
        <div className="flex flex-col">
           <span className="text-sm font-bold text-slate-900">{new Date(value).toLocaleDateString()}</span>
           <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Logged Date</span>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!requestData) return null;

  const statusData = requestData.statusBreakdown?.map((item) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
  })) || [];

  const urgencyData = requestData.urgencyBreakdown?.map((item) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
  })) || [];

  return (
    <div className="min-h-screen bg-transparent font-body py-12 md:py-20 pb-40 animate-slide-up">
      <div className="container-custom">
        
        {/* Header Section */}
        <div className="mb-12 md:mb-20 animate-reveal">
           <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-rose-100">
                Live Requirement Map
              </span>
           </div>
           <h1 className="text-4xl md:text-6xl font-display font-black text-slate-900 tracking-tight leading-tight mb-6">
             Patient <span className="text-gradient">Requests</span>
           </h1>
           <p className="text-lg md:text-xl text-slate-500 max-w-2xl font-medium leading-relaxed">
             Monitoring real-time blood requirements across the network. Urgent cases are prioritized by our AI matching engine.
           </p>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 mb-16 animate-reveal" style={{ animationDelay: '0.1s' }}>
          {statusData.length > 0 && (
            <div className="card-premium h-full">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-sky-50 text-sky-500 rounded-2xl">
                     <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-slate-900">Pipeline Status</h3>
               </div>
               <ChartCard
                 title=""
                 data={statusData}
                 type="pie"
                 colors={['#0ea5e9', '#10b981', '#f59e0b', '#6366f1']}
               />
            </div>
          )}
          {urgencyData.length > 0 && (
            <div className="card-premium h-full">
               <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
                     <ShieldAlert className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-slate-900">Urgency Load</h3>
               </div>
               <ChartCard
                 title=""
                 data={urgencyData}
                 type="bar"
                 colors={['#f43f5e', '#f59e0b', '#fbbf24', '#10b981']}
               />
            </div>
          )}
        </div>

        {/* Request Feed */}
        <div className="animate-reveal" style={{ animationDelay: '0.2s' }}>
          <div className="card-premium overflow-hidden">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-black text-slate-900">Active Demand Feed</h2>
                <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest">
                   <Clock className="w-4 h-4" /> Live Tracking
                </div>
             </div>
             <TablePreview
               title=""
               data={requestData.recentRequests || []}
               columns={urgencyColumns}
               emptyMessage="No active requests found in the current cycle."
               maxRows={10}
             />
          </div>
        </div>

        {/* Hero CTA for Donors */}
        <div className="mt-20 p-8 md:p-12 bg-white border border-slate-100 rounded-[32px] md:rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-8 animate-reveal" style={{ animationDelay: '0.3s' }}>
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-50 text-rose-500 rounded-[24px] md:rounded-[28px] flex items-center justify-center shadow-xl shadow-rose-200/50 flex-shrink-0">
                 <Droplets className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <div className="text-left">
                 <h3 className="text-2xl md:text-3xl font-display font-black text-slate-900">Response is Action</h3>
                 <p className="text-slate-500 font-medium text-sm md:text-base">Your donation can close these pending requests today.</p>
              </div>
           </div>
           <button onClick={() => navigate('/register')} className="btn-primary w-full md:w-auto py-4 md:py-5 px-12 text-lg shadow-2xl shadow-sky-500/20 group">
              Become a Hero <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
           </button>
        </div>

      </div>
    </div>
  );
};

export default RequestsPage;
