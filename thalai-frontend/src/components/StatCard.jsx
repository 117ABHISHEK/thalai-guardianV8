const StatCard = ({ title, value, icon, color = 'blue', trend, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    teal: 'bg-primary-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-xs mt-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-4 rounded-full text-white text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

