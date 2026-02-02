import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Activity, Droplets, Users, ShieldCheck } from 'lucide-react';

const StatsCharts = ({ stats }) => {
  const bloodGroupData = stats?.bloodGroupDistribution?.map((item) => ({
    name: item._id || 'UNK',
    value: item.count,
  })) || [];

  const roleComparisonData = [
    { name: 'Patients', count: stats?.totalPatients || 0, fill: '#0ea5e9' },
    { name: 'Heroes', count: stats?.totalDonors || 0, fill: '#f43f5e' },
    { name: 'Verified', count: stats?.verifiedDonors || 0, fill: '#10b981' },
  ];

  const COLORS = ['#0ea5e9', '#f43f5e', '#10b981', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899', '#94a3b8'];

  return (
    <div className="space-y-10">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Blood Group Distribution */}
        <div className="bg-slate-50/50 rounded-[40px] p-8 border border-white/40 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-center mb-10">
             <div>
                <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Biological Spread</h3>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Network Blood Group Analytics</p>
             </div>
             <div className="p-3 bg-white rounded-2xl shadow-sm"><Droplets className="w-5 h-5 text-rose-500" /></div>
          </div>
          
          <div className="h-[300px] w-full">
            {bloodGroupData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                    itemStyle={{ fontWeight: '900', fontSize: '12px', textTransform: 'uppercase' }}
                  />
                  <Pie
                    data={bloodGroupData}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {bloodGroupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                 <Activity className="w-10 h-10 mb-2 opacity-20" />
                 <p className="text-xs font-bold">Synchronizing telemetry data...</p>
              </div>
            )}
          </div>
        </div>

        {/* User Base Bar Chart */}
        <div className="bg-slate-50/50 rounded-[40px] p-8 border border-white/40 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-center mb-10">
             <div>
                <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">User Equilibrium</h3>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Growth & Verification Ratio</p>
             </div>
             <div className="p-3 bg-white rounded-2xl shadow-sm"><Users className="w-5 h-5 text-sky-500" /></div>
          </div>

          <div className="h-[300px] w-full px-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roleComparisonData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontWeight: 900, fontSize: 10 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.4)', radius: 16 }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                />
                <Bar 
                  dataKey="count" 
                  radius={[16, 16, 16, 16]} 
                  barSize={40}
                >
                  {roleComparisonData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hero Stats Row */}
      {stats?.donorStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { label: 'Total Hero Profiles', value: stats.donorStats.totalDonorProfiles || 0, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
             { label: 'Deployment Ready', value: stats.donorStats.availableDonors || 0, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
             { label: 'Platform Impact', value: stats.donorStats.totalDonationsCount || 0, icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' }
           ].map((stat, i) => (
             <div key={i} className="p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all flex items-center justify-between group">
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">{stat.label}</p>
                   <p className="text-4xl font-display font-black text-slate-900 group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
                   <stat.icon className="w-8 h-8" />
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default StatsCharts;
