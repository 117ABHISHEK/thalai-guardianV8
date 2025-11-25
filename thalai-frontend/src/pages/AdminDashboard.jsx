import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStats } from '../api/admin';
import StatsCharts from '../components/StatsCharts';
import StatCard from '../components/StatCard';

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
      const response = await getStats();
      setStats(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/donor-verification')}
                className="btn-primary"
              >
                Manage Donors
              </button>
              <button
                onClick={() => navigate('/admin/requests')}
                className="btn-primary"
              >
                Manage Requests
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Patients"
            value={stats?.totalPatients || 0}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Total Donors"
            value={stats?.totalDonors || 0}
            icon="🩸"
            color="teal"
          />
          <StatCard
            title="Verified Donors"
            value={stats?.verifiedDonors || 0}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Pending Requests"
            value={stats?.pendingRequests || 0}
            icon="⏳"
            color="orange"
          />
          <StatCard
            title="Completed Requests"
            value={stats?.completedRequests || 0}
            icon="✓"
            color="green"
          />
          <StatCard
            title="Available Donors"
            value={stats?.donorStats?.availableDonors || 0}
            icon="📊"
            color="blue"
          />
        </div>

        {/* Charts */}
        {stats && <StatsCharts stats={stats} />}

        {/* Quick Actions */}
        <div className="card mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/donor-verification')}
              className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              <div className="text-3xl mb-2">👤</div>
              <div className="font-semibold">Verify Donors</div>
            </button>
            <button
              onClick={() => navigate('/admin/requests')}
              className="p-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all transform hover:scale-105"
            >
              <div className="text-3xl mb-2">📋</div>
              <div className="font-semibold">Manage Requests</div>
            </button>
            <button
              onClick={fetchStats}
              className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
            >
              <div className="text-3xl mb-2">🔄</div>
              <div className="font-semibold">Refresh Stats</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
