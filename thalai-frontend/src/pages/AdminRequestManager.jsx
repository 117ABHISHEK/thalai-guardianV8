import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllRequests, cancelRequest } from '../api/requests';

const AdminRequestManager = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    bloodGroup: '',
    urgency: '',
  });

  useEffect(() => {
    fetchRequests();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, [filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getAllRequests(filters);
      setRequests(response.data.requests || []);
    } catch (err) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) {
      return;
    }

    try {
      await cancelRequest(requestId);
      setMessage('Request cancelled successfully');
      setTimeout(() => setMessage(''), 3000);
      fetchRequests();
    } catch (err) {
      setError(err.message || 'Failed to cancel request');
      setTimeout(() => setError(''), 5000);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: '#fff3cd', color: '#856404', text: 'Pending' },
      searching: { bg: '#d1ecf1', color: '#0c5460', text: 'Searching' },
      completed: { bg: '#d4edda', color: '#155724', text: 'Completed' },
      cancelled: { bg: '#f8d7da', color: '#721c24', text: 'Cancelled' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span
        style={{
          backgroundColor: badge.bg,
          color: badge.color,
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '500',
        }}
      >
        {badge.text}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      low: { bg: '#d4edda', color: '#155724', text: 'Low' },
      medium: { bg: '#fff3cd', color: '#856404', text: 'Medium' },
      high: { bg: '#f8d7da', color: '#721c24', text: 'High' },
      critical: { bg: '#dc3545', color: 'white', text: 'Critical' },
    };
    const badge = badges[urgency] || badges.medium;
    return (
      <span
        style={{
          backgroundColor: badge.bg,
          color: badge.color,
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '500',
        }}
      >
        {badge.text}
      </span>
    );
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      bloodGroup: '',
      urgency: '',
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading requests...</div>
      </div>
    );
  }

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Request Management</h1>
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

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* Filters */}
      <div style={styles.card}>
        <h3>Filters</h3>
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              style={styles.filterInput}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="searching">Searching</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label>Blood Group</label>
            <select
              name="bloodGroup"
              value={filters.bloodGroup}
              onChange={handleFilterChange}
              style={styles.filterInput}
            >
              <option value="">All Blood Groups</option>
              {bloodGroups.map((bg) => (
                <option key={bg} value={bg}>
                  {bg}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label>Urgency</label>
            <select
              name="urgency"
              value={filters.urgency}
              onChange={handleFilterChange}
              style={styles.filterInput}
            >
              <option value="">All Urgency</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div style={styles.filterGroup}>
            <button onClick={clearFilters} style={styles.clearButton}>
              Clear Filters
            </button>
          </div>
        </div>
        <p style={styles.countText}>
          Showing {requests.length} request(s)
        </p>
      </div>

      {/* Requests Table */}
      <div style={styles.card}>
        <h3>All Blood Requests</h3>
        {requests.length === 0 ? (
          <div style={styles.noData}>No requests found</div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Blood Group</th>
                  <th style={styles.th}>Units</th>
                  <th style={styles.th}>Urgency</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td style={styles.td}>
                      <div>
                        <strong>{request.patientId?.name || 'N/A'}</strong>
                        <br />
                        <span style={styles.emailText}>
                          {request.patientId?.email || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <strong>{request.bloodGroup}</strong>
                    </td>
                    <td style={styles.td}>{request.unitsRequired}</td>
                    <td style={styles.td}>{getUrgencyBadge(request.urgency)}</td>
                    <td style={styles.td}>{getStatusBadge(request.status)}</td>
                    <td style={styles.td}>
                      {request.location?.hospital || 'N/A'}
                      {request.location?.city && (
                        <span style={styles.locationText}>
                          <br />
                          {request.location.city}
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      {new Date(request.createdAt).toLocaleDateString()}
                      <br />
                      <span style={styles.timeText}>
                        {new Date(request.createdAt).toLocaleTimeString()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {request.status !== 'cancelled' &&
                        request.status !== 'completed' && (
                          <button
                            onClick={() => handleCancel(request._id)}
                            style={styles.cancelButton}
                          >
                            Cancel
                          </button>
                        )}
                      {request.status === 'cancelled' && (
                        <span style={styles.cancelledText}>Cancelled</span>
                      )}
                      {request.status === 'completed' && (
                        <span style={styles.completedText}>Completed</span>
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
  filterRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '15px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '5px',
    fontWeight: '500',
    fontSize: '14px',
  },
  filterInput: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  clearButton: {
    padding: '8px 16px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '20px',
  },
  countText: {
    color: '#666',
    margin: 0,
    fontSize: '14px',
  },
  tableContainer: {
    overflowX: 'auto',
    marginTop: '15px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'left',
    borderBottom: '2px solid #dee2e6',
    fontWeight: '600',
    fontSize: '14px',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #dee2e6',
    fontSize: '14px',
  },
  emailText: {
    fontSize: '12px',
    color: '#666',
  },
  timeText: {
    fontSize: '12px',
    color: '#666',
  },
  locationText: {
    fontSize: '12px',
    color: '#666',
  },
  cancelButton: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  cancelledText: {
    fontSize: '12px',
    color: '#721c24',
    fontStyle: 'italic',
  },
  completedText: {
    fontSize: '12px',
    color: '#155724',
    fontStyle: 'italic',
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
    padding: '40px',
    color: '#666',
    fontStyle: 'italic',
  },
};

export default AdminRequestManager;

