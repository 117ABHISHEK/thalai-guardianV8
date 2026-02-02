import { useEffect, useState } from 'react';
import { getPublicDonors } from '../api/public';
import TablePreview from '../components/TablePreview';
import StatCard from '../components/StatCard';
import { Droplets, CheckCircle, Heart, Search, Users, ShieldCheck, MapPin, Calendar, HeartPulse, Activity } from 'lucide-react';

const DonorsPage = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const response = await getPublicDonors(20);
      setDonors(response.data.donors || []);
    } catch (error) {
      console.error('Failed to fetch donors:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Donor Identity',
      key: 'name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-black text-sm border border-sky-100">
            {value?.charAt(0) || 'D'}
          </div>
          <div>
            <p className="font-bold text-slate-900">{value}</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Verified Hero</p>
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      key: 'bloodGroup',
      render: (value) => (
        <span className="font-black text-rose-500 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100">{value}</span>
      ),
    },
    {
      header: 'Contribution',
      key: 'totalDonations',
      render: (value) => (
        <div className="flex items-center gap-2">
           <HeartPulse className="w-4 h-4 text-emerald-500" />
           <span className="text-slate-900 font-bold">{value} <span className="text-slate-400 font-medium">Lives</span></span>
        </div>
      ),
    },
    {
      header: 'Presence',
      key: 'isAvailable',
      render: (value) => (
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${value ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
           <span className={`text-[10px] font-black uppercase tracking-widest ${value ? 'text-emerald-600' : 'text-slate-500'}`}>
             {value ? 'Active Now' : 'Off-duty'}
           </span>
        </div>
      ),
    },
    {
      header: 'Last Cycle',
      key: 'lastDonationDate',
      render: (value) => (
        <span className="text-xs text-slate-500 font-medium italic">
          {value ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'First Donation'}
        </span>
      ),
    },
  ];

  const availableCount = donors.filter((d) => d.isAvailable).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-body py-20 pb-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title Section */}
        <div className="mb-20 animate-reveal">
           <div className="flex items-center gap-3 mb-4">
              <span className="px-4 py-1 bg-sky-50 text-sky-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-sky-100">
                A Global Network
              </span>
           </div>
           <h1 className="text-5xl md:text-6xl font-display font-black text-slate-900 tracking-tight leading-none mb-6">
             Our Lifetime <span className="text-gradient">Heroes</span>
           </h1>
           <p className="text-xl text-slate-500 max-w-2xl font-medium leading-relaxed">
             Connecting with the most reliable blood donors. Every entry here represents a commitment to saving lives.
           </p>
        </div>

        {/* Dynamic Telemetry Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-reveal" style={{ animationDelay: '0.1s' }}>
          <StatCard
            title="Registry Total"
            value={donors.length}
            icon={<Users className="w-6 h-6" />}
            color="blue"
            subtitle="Verified clinical donors"
          />
          <StatCard
            title="Active Presence"
            value={availableCount}
            icon={<Activity className="w-6 h-6" />}
            color="green"
            subtitle="Ready for immediate response"
          />
          <StatCard
            title="Total Impact"
            value={donors.reduce((sum, d) => sum + (d.totalDonations || 0), 0)}
            icon={<Heart className="w-6 h-6" />}
            color="red"
            subtitle="Successful donations recorded"
          />
        </div>

        {/* Registry Table */}
        <div className="animate-reveal" style={{ animationDelay: '0.2s' }}>
          {loading ? (
             <div className="card-premium h-96 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
             </div>
          ) : (
             <div className="card-premium h-full overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-2xl font-display font-black text-slate-900">Clinical Hero Registry</h2>
                   <div className="flex items-center gap-4">
                      <div className="relative">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                         <input type="text" placeholder="Search registry..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                      </div>
                      <button className="p-2.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-100 hover:bg-sky-500 hover:text-white transition-all">
                         <MapPin className="w-5 h-5" />
                      </button>
                   </div>
                </div>
                <TablePreview
                   title=""
                   data={donors}
                   columns={columns}
                   emptyMessage="The registry is currently being synchronized..."
                   maxRows={20}
                />
             </div>
          )}
        </div>

        {/* Search CTA */}
        <div className="mt-20 p-12 bg-slate-900 rounded-[48px] text-center relative overflow-hidden animate-reveal" style={{ animationDelay: '0.3s' }}>
           <div className="absolute top-0 right-0 p-12 opacity-10">
              <ShieldCheck className="w-48 h-48 text-white" />
           </div>
           <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-display font-black text-white">Can't Find a Specific Match?</h2>
              <p className="text-slate-400 font-medium">Our AI matching system can help you find compatible donors specifically for your case. Sign in to your patient dashboard for personalized results.</p>
              <div className="flex justify-center gap-4 pt-4">
                 <button className="btn-primary px-10 py-4">Request Donor Map</button>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default DonorsPage;
