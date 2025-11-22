import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicRequests } from '../api/public';
import ChartCard from '../components/ChartCard';

const RequestPreview = () => {
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

  if (loading) {
    return (
      <div className="card animate-fade-in">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-blue mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!requestData) return null;

  const statusData = requestData.statusBreakdown?.map((item) => ({
    name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count,
  })) || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Request Overview</h2>
        <Link
          to="/requests"
          className="text-health-blue hover:text-blue-700 font-medium text-sm"
        >
          View All →
        </Link>
      </div>
      <div className="card animate-fade-in">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
            <p className="text-2xl font-bold text-red-600">
              {requestData.totalPending || 0}
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Urgent Requests</p>
            <p className="text-2xl font-bold text-orange-600">
              {requestData.totalUrgent || 0}
            </p>
          </div>
        </div>
        {statusData.length > 0 && (
          <ChartCard
            title="Request Status Distribution"
            data={statusData}
            type="pie"
            colors={['#1976d2', '#009688', '#4caf50', '#ff9800']}
          />
        )}
      </div>
    </div>
  );
};

export default RequestPreview;

