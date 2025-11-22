import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const StatsCharts = ({ stats }) => {
  // Prepare blood group data for pie chart
  const bloodGroupData = stats?.bloodGroupDistribution?.map((item) => ({
    name: item._id || 'Unknown',
    value: item.count,
  })) || [];

  // Prepare data for bar chart (patients vs donors)
  const roleComparisonData = [
    {
      name: 'Patients',
      count: stats?.totalPatients || 0,
    },
    {
      name: 'Donors',
      count: stats?.totalDonors || 0,
    },
    {
      name: 'Verified Donors',
      count: stats?.verifiedDonors || 0,
    },
  ];

  // Colors for pie chart
  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
  ];

  return (
    <div style={styles.container}>
      <div style={styles.chartGrid}>
        {/* Blood Group Distribution Pie Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Blood Group Distribution</h3>
          {bloodGroupData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={bloodGroupData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {bloodGroupData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={styles.noData}>No data available</p>
          )}
        </div>

        {/* Role Comparison Bar Chart */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Users Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roleComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Donor Statistics Card */}
      {stats?.donorStats && (
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Donor Statistics</h3>
          <div style={styles.statsRow}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Donor Profiles:</span>
              <span style={styles.statValue}>
                {stats.donorStats.totalDonorProfiles || 0}
              </span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Available Donors:</span>
              <span style={styles.statValue}>
                {stats.donorStats.availableDonors || 0}
              </span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Donations:</span>
              <span style={styles.statValue}>
                {stats.donorStats.totalDonationsCount || 0}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '20px',
  },
  chartGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
    marginBottom: '20px',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  chartTitle: {
    marginBottom: '20px',
    color: '#333',
    fontSize: '18px',
    fontWeight: '600',
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    padding: '40px',
    fontStyle: 'italic',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '20px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    minWidth: '150px',
  },
  statLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
};

export default StatsCharts;

