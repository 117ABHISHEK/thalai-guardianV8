import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicDonors } from '../api/public';
import TablePreview from '../components/TablePreview';

const DonorPreview = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const response = await getPublicDonors(5);
      setDonors(response.data.donors || []);
    } catch (error) {
      console.error('Failed to fetch donors:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Name',
      key: 'name',
    },
    {
      header: 'Blood Group',
      key: 'bloodGroup',
      render: (value) => (
        <span className="font-semibold text-health-blue">{value}</span>
      ),
    },
    {
      header: 'Donations',
      key: 'totalDonations',
      render: (value) => (
        <span className="text-primary-600 font-medium">{value}</span>
      ),
    },
    {
      header: 'Status',
      key: 'isAvailable',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Available' : 'Unavailable'}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="card animate-fade-in">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-blue mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Top Donors</h2>
        <Link
          to="/donors"
          className="text-health-blue hover:text-blue-700 font-medium text-sm"
        >
          View All →
        </Link>
      </div>
      <TablePreview
        title=""
        data={donors}
        columns={columns}
        emptyMessage="No donors available"
        maxRows={5}
      />
    </div>
  );
};

export default DonorPreview;

