import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon, color = 'blue', trend, subtitle }) => {
  const themes = {
    blue: { bg: 'bg-sky-50', iconBg: 'bg-sky-500', text: 'text-sky-600', shadow: 'shadow-sky-200/50' },
    teal: { bg: 'bg-teal-50', iconBg: 'bg-teal-500', text: 'text-teal-600', shadow: 'shadow-teal-200/50' },
    green: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', text: 'text-emerald-600', shadow: 'shadow-emerald-200/50' },
    orange: { bg: 'bg-orange-50', iconBg: 'bg-orange-500', text: 'text-orange-600', shadow: 'shadow-orange-200/50' },
    red: { bg: 'bg-rose-50', iconBg: 'bg-rose-500', text: 'text-rose-600', shadow: 'shadow-rose-200/50' },
    purple: { bg: 'bg-indigo-50', iconBg: 'bg-indigo-500', text: 'text-indigo-600', shadow: 'shadow-indigo-200/50' },
  };

  const theme = themes[color] || themes.blue;

  return (
    <div className={`group p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 animate-reveal`}>
      <div className="flex items-start justify-between">
        <div className="space-y-4">
          <div className={`inline-flex p-3 rounded-2xl ${theme.bg} ${theme.text} transition-colors duration-300`}>
            {icon && typeof icon === 'object' ? icon : <div className="w-6 h-6">{icon}</div>}
          </div>
          
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight">{value}</h3>
              {trend && (
                <div className={`flex items-center gap-0.5 text-[11px] font-black px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{Math.abs(trend)}%</span>
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs font-medium text-slate-400 mt-1.5">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Decorative background element */}
        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700 ${theme.iconBg}`} />
      </div>
    </div>
  );
};

export default StatCard;
