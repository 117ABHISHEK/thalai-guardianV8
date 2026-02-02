import { Users, Droplets, ClipboardList, AlertCircle, Activity, ShieldCheck, HeartPulse, Zap } from 'lucide-react';

const PublicStats = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      title: "Global Patients",
      value: stats.totalPatients || 0,
      icon: <Users className="w-6 h-6" />,
      color: "text-sky-500",
      bg: "bg-sky-50",
      subtitle: "Managed care profiles"
    },
    {
      title: "Active Heroes",
      value: stats.verifiedDonors || 0,
      icon: <Droplets className="w-6 h-6" />,
      color: "text-rose-500",
      bg: "bg-rose-50",
      subtitle: `${stats.activeDonors || 0} Ready now`
    },
    {
      title: "Clinical Flux",
      value: stats.totalRequests || 0,
      icon: <Activity className="w-6 h-6" />,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      subtitle: `${stats.pendingRequests || 0} Processing`
    },
    {
      title: "Critical Priority",
      value: stats.urgentRequests || 0,
      icon: <Zap className="w-6 h-6" />,
      color: "text-amber-500",
      bg: "bg-amber-50",
      subtitle: "AI urgent detection"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
      {cards.map((card, idx) => (
        <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left group">
          <div className={`p-4 rounded-2xl ${card.bg} ${card.color} mb-5 shadow-sm transition-transform group-hover:scale-110 duration-500`}>
             {card.icon}
          </div>
          <div>
             <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5">{card.title}</p>
             <h3 className="text-4xl font-display font-black text-slate-900 tracking-tight leading-none mb-2">{card.value}</h3>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PublicStats;
