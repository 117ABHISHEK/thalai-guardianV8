import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/auth';

const DonorMatchResults = () => {
  const { requestId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (requestId) {
      findMatches();
    }
  }, [requestId]);

  const findMatches = async () => {
    try {
      setLoading(true);
      const response = await api.post('/match/find', { requestId });
      setMatches(response.data.data.matches || []);
      setRequest(response.data.data.request);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to find matches');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Finding matching donors...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Donor Match Results</h1>
        <button onClick={logout} style={styles.logoutButton}>
          Logout
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {request && (
        <div style={styles.requestCard}>
          <h2>Request Details</h2>
          <div style={styles.requestInfo}>
            <p><strong>Blood Group:</strong> {request.bloodGroup}</p>
            <p><strong>Units Required:</strong> {request.unitsRequired}</p>
            <p><strong>Urgency:</strong> {request.urgency.toUpperCase()}</p>
          </div>
        </div>
      )}

      <div style={styles.matchesCard}>
        <div style={styles.cardHeader}>
          <h2>Matched Donors ({matches.length})</h2>
          <button onClick={findMatches} style={styles.refreshButton}>
            🔄 Refresh
          </button>
        </div>

        {matches.length === 0 ? (
          <div style={styles.noMatches}>
            <p>No matching donors found at this time.</p>
            <p style={styles.noMatchesSubtext}>
              We'll notify you when matches become available.
            </p>
          </div>
        ) : (
          <div style={styles.matchesList}>
            {matches.map((match, index) => (
              <div key={index} style={styles.matchCard}>
                <div style={styles.matchHeader}>
                  <div>
                    <h3 style={styles.donorName}>
                      {match.name || 'Anonymous Donor'}
                    </h3>
                    <p style={styles.donorInfo}>
                      {match.bloodGroup} • {match.email}
                    </p>
                  </div>
                  <div
                    style={{
                      ...styles.scoreBadge,
                      backgroundColor: getScoreColor(match.matchScore),
                    }}
                  >
                    {match.matchScore}%
                  </div>
                </div>

                <div style={styles.scoreBreakdown}>
                  <div style={styles.scoreItem}>
                    <span>Location:</span>
                    <span>{match.scoreBreakdown.locationScore}%</span>
                  </div>
                  <div style={styles.scoreItem}>
                    <span>Availability:</span>
                    <span>{match.scoreBreakdown.availabilityScore}%</span>
                  </div>
                  <div style={styles.scoreItem}>
                    <span>Frequency:</span>
                    <span>{match.scoreBreakdown.donationFrequencyScore}%</span>
                  </div>
                  <div style={styles.scoreItem}>
                    <span>AI Prediction:</span>
                    <span>{match.scoreBreakdown.aiPredictionScore}%</span>
                  </div>
                </div>

                {match.phone && (
                  <div style={styles.contactInfo}>
                    <strong>Contact:</strong> {match.phone}
                  </div>
                )}

                <div style={styles.actions}>
                  <button
                    style={styles.contactButton}
                    onClick={() => {
                      if (match.phone) {
                        window.location.href = `tel:${match.phone}`;
                      }
                    }}
                  >
                    📞 Contact
                  </button>
                </div>
              </div>
            ))}
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
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '4px',
    marginBottom: '20px',
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  requestInfo: {
    lineHeight: '1.8',
  },
  matchesCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  cardHeader: {
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
  },
  noMatches: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#666',
  },
  noMatchesSubtext: {
    marginTop: '10px',
    fontSize: '14px',
  },
  matchesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  matchCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fafafa',
  },
  matchHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px',
  },
  donorName: {
    margin: 0,
    fontSize: '18px',
    color: '#333',
  },
  donorInfo: {
    margin: '5px 0 0 0',
    color: '#666',
    fontSize: '14px',
  },
  scoreBadge: {
    padding: '8px 16px',
    borderRadius: '20px',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  scoreBreakdown: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginBottom: '15px',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '6px',
  },
  scoreItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '14px',
  },
  contactInfo: {
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  actions: {
    display: 'flex',
    gap: '10px',
  },
  contactButton: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default DonorMatchResults;

