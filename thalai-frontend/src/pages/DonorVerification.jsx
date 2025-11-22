import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDonors, verifyDonor } from '../api/admin';

const DonorVerification = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all'); // all, verified, unverified

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await getDonors();
      setDonors(response.data.donors || []);
    } catch (err) {
      setError(err.message || 'Failed to load donors');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (donorId) => {
    try {
      await verifyDonor(donorId);
      setMessage('Donor verified successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchDonors(); // Refresh the list
    } catch (err) {
      setError(err.message || 'Failed to verify donor');
      setTimeout(() => setError(''), 5000);
    }
  };

  const filteredDonors = donors.filter((donor) => {
    if (filter === 'verified') return donor.isVerified;
    if (filter === 'unverified') return !donor.isVerified;
    return true;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading donors...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Donor Verification</h1>
        <div style={styles.headerActions}>
          <button
            onClick={() => navigate('/admin-dashboard')}
            style={styles.backButton}
          >
            ← Back to Dashboard
          </button>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {message && (
        <div style={styles.success}>{message}</div>
      )}
      {error && (
        <div style={styles.error}>{error}</div>
      )}

      {/* Filter Section */}
      <div style={styles.card}>
        <div style={styles.filterSection}>
          <label style={styles.filterLabel}>Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Donors</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Unverified Only</option>
          </select>
          <button onClick={fetchDonors} style={styles.refreshButton}>
            🔄 Refresh
          </button>
        </div>
        <p style={styles.countText}>
          Showing {filteredDonors.length} of {donors.length} donors
        </p>
      </div>

      {/* Donors List */}
      <div style={styles.card}>
        <h2>Donor List</h2>
        {filteredDonors.length === 0 ? (
          <p style={styles.noData}>No donors found</p>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Blood Group</th>
                  <th style={styles.th}>Phone</th>
                  <th style={styles.th}>Availability</th>
                  <th style={styles.th}>Total Donations</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonors.map((donor) => (
                  <tr key={donor._id}>
                    <td style={styles.td}>{donor.user?.name || 'N/A'}</td>
                    <td style={styles.td}>{donor.user?.email || 'N/A'}</td>
                    <td style={styles.td}>{donor.user?.bloodGroup || 'N/A'}</td>
                    <td style={styles.td}>{donor.user?.phone || 'N/A'}</td>
                    <td style={styles.td}>
                      <span
                        style={
                          donor.availabilityStatus
                            ? styles.availableBadge
                            : styles.unavailableBadge
                        }
                      >
                        {donor.availabilityStatus ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td style={styles.td}>{donor.totalDonations || 0}</td>
                    <td style={styles.td}>
                      {donor.isVerified ? (
                        <span style={styles.verifiedBadge}>✓ Verified</span>
                      ) : (
                        <span style={styles.unverifiedBadge}>⚠ Unverified</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {!donor.isVerified ? (
                        <button
                          onClick={() => handleVerify(donor._id)}
                          style={styles.verifyButton}
                        >
                          Verify
                        </button>
                      ) : (
                        <span style={styles.verifiedText}>
                          Verified by {donor.verifiedBy?.name || 'Admin'}
                          {donor.verifiedAt &&
                            ` on ${new Date(donor.verifiedAt).toLocaleDateString()}`}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '50vh',
    fontSize: '18px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  filterSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
  },
  filterLabel: {
    fontWeight: '500',
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
  },
  refreshButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  countText: {
    color: '#666',
    margin: 0,
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px',
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
    fontWeight: '600',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6',
  },
  availableBadge: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  unavailableBadge: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  verifiedBadge: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  unverifiedBadge: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  verifyButton: {
    padding: '6px 12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  verifiedText: {
    fontSize: '12px',
    color: '#666',
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    padding: '40px',
    fontStyle: 'italic',
  },
};

export default DonorVerification;

