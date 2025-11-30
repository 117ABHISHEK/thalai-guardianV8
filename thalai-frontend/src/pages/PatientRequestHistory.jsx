import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserRequests, cancelRequest } from '../api/requests';
import { findMatches } from '../api/match';

const PatientRequestHistory = ({ onRequestCancelled }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [findingMatches, setFindingMatches] = useState({});

  useEffect(() => {
    fetchRequests();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchRequests();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getUserRequests(user._id || user.id);
      setRequests(response.data.requests || []);
    } catch (err) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
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
      if (onRequestCancelled) {
        onRequestCancelled();
      }
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

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading requests...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>My Blood Requests</h2>
        <button onClick={fetchRequests} style={styles.refreshButton}>
          🔄 Refresh
        </button>
      </div>

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {requests.length === 0 ? (
        <div style={styles.noData}>
          <p>No blood requests found.</p>
          <p style={styles.noDataSubtext}>Create your first blood request to get started.</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Blood Group</th>
                <th style={styles.th}>Units</th>
                <th style={styles.th}>Urgency</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td style={styles.td}>
                    <strong>{request.bloodGroup}</strong>
                  </td>
                  <td style={styles.td}>{request.unitsRequired}</td>
                  <td style={styles.td}>{getUrgencyBadge(request.urgency)}</td>
                  <td style={styles.td}>{getStatusBadge(request.status)}</td>
                  <td style={styles.td}>
                    {new Date(request.createdAt).toLocaleDateString()}
                    <br />
                    <span style={styles.timeText}>
                      {new Date(request.createdAt).toLocaleTimeString()}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {request.location?.hospital || 'N/A'}
                    {request.location?.city && (
                      <span style={styles.locationText}>
                        <br />
                        {request.location.city}, {request.location.state}
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      {request.status !== 'cancelled' &&
                        request.status !== 'completed' && (
                          <>
                            <button
                              onClick={() => handleFindMatches(request._id)}
                              disabled={findingMatches[request._id]}
                              style={styles.findMatchesButton}
                            >
                              {findingMatches[request._id]
                                ? 'Finding...'
                                : '🔍 Find Matches'}
                            </button>
                            <button
                              onClick={() => handleCancel(request._id)}
                              style={styles.cancelButton}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      {request.status === 'cancelled' && (
                        <span style={styles.cancelledText}>
                          Cancelled{' '}
                          {request.cancelledAt &&
                            new Date(request.cancelledAt).toLocaleDateString()}
                        </span>
                      )}
                      {request.status === 'completed' && (
                        <span style={styles.completedText}>
                          Completed{' '}
                          {request.completedAt &&
                            new Date(request.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  refreshButton: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
  },
  tableContainer: {
    overflowX: 'auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
  timeText: {
    fontSize: '12px',
    color: '#666',
  },
  locationText: {
    fontSize: '12px',
    color: '#666',
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  findMatchesButton: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
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
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  noData: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  noDataSubtext: {
    color: '#666',
    marginTop: '10px',
    fontSize: '14px',
  },
};

export default PatientRequestHistory;

