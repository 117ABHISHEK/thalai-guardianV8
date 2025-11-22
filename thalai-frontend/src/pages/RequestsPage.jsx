import { useEffect, useState } from 'react';
import { getPublicRequests } from '../api/public';
import ChartCard from '../components/ChartCard';
import TablePreview from '../components/TablePreview';

const RequestsPage = () => {
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
      header: 'Blood Group',
      key: 'bloodGroup',
      render: (value) => (
        <span className="font-semibold text-health-blue">{value}</span>
      ),
    },
    {
      header: 'Units',
      key: 'unitsRequired',
    },
    {
      header: 'Urgency',
      key: 'urgency',
      render: (value) => {
        const colors = {
          critical: 'bg-red-100 text-red-800',
          high: 'bg-orange-100 text-orange-800',
          medium: 'bg-yellow-100 text-yellow-800',
          low: 'bg-green-100 text-green-800',
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              colors[value] || colors.medium
            }`}
          >
            {value.toUpperCase()}
          </span>
        );
      },
    },
    {
      header: 'Status',
      key: 'status',
      render: (value) => {
        const colors = {
          pending: 'bg-yellow-100 text-yellow-800',
          searching: 'bg-blue-100 text-blue-800',
          completed: 'bg-green-100 text-green-800',
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              colors[value] || colors.pending
            }`}
          >
            {value.toUpperCase()}
          </span>
        );
      },
    },
    {
      header: 'Created',
      key: 'createdAt',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-blue mx-auto"></div>
            </div>
          </div>
        </div>
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Blood Requests
          </h1>
          <p className="text-gray-600">
            Current blood requests from thalassemia patients
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {statusData.length > 0 && (
            <ChartCard
              title="Request Status"
              data={statusData}
              type="pie"
              colors={['#1976d2', '#009688', '#4caf50', '#ff9800']}
            />
          )}
          {urgencyData.length > 0 && (
            <ChartCard
              title="Urgency Distribution"
              data={urgencyData}
              type="bar"
              colors={['#dc3545', '#ff9800', '#ffc107', '#4caf50']}
            />
          )}
        </div>

        <TablePreview
          title="Recent Requests"
          data={requestData.recentRequests || []}
          columns={urgencyColumns}
          emptyMessage="No active requests"
          maxRows={10}
        />
      </div>
    </div>
  );
};

export default RequestsPage;

