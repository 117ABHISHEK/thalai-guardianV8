import { useEffect, useState } from 'react';
import { getPublicDonors } from '../api/public';
import TablePreview from '../components/TablePreview';
import StatCard from '../components/StatCard';

const DonorsPage = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const response = await getPublicDonors(20);
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
      header: 'Total Donations',
      key: 'totalDonations',
      render: (value) => (
        <span className="text-primary-600 font-medium">{value}</span>
      ),
    },
    {
      header: 'Last Donation',
      key: 'lastDonationDate',
      render: (value) =>
        value ? new Date(value).toLocaleDateString() : 'N/A',
    },
    {
      header: 'Status',
      key: 'isAvailable',
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
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

  const availableCount = donors.filter((d) => d.isAvailable).length;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Donors</h1>
          <p className="text-gray-600">
            Meet our verified blood donors who are making a difference
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Donors"
            value={donors.length}
            icon="🩸"
            color="teal"
          />
          <StatCard
            title="Available Now"
            value={availableCount}
            icon="✅"
            color="green"
          />
          <StatCard
            title="Total Donations"
            value={donors.reduce((sum, d) => sum + (d.totalDonations || 0), 0)}
            icon="❤️"
            color="red"
          />
        </div>

        {loading ? (
          <div className="card">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-blue mx-auto"></div>
            </div>
          </div>
        ) : (
          <TablePreview
            title="Verified Donors"
            data={donors}
            columns={columns}
            emptyMessage="No donors available"
            maxRows={20}
          />
        )}
      </div>
    </div>
  );
};

export default DonorsPage;

