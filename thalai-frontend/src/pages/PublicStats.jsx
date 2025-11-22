import StatCard from '../components/StatCard';

const PublicStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
        System Statistics
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients || 0}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Verified Donors"
          value={stats.verifiedDonors || 0}
          icon="🩸"
          color="teal"
          subtitle={`${stats.activeDonors || 0} currently available`}
        />
        <StatCard
          title="Total Requests"
          value={stats.totalRequests || 0}
          icon="📋"
          color="green"
          subtitle={`${stats.pendingRequests || 0} pending`}
        />
        <StatCard
          title="Urgent Requests"
          value={stats.urgentRequests || 0}
          icon="🚨"
          color="red"
          subtitle="Need immediate attention"
        />
      </div>
    </div>
  );
};

export default PublicStats;

