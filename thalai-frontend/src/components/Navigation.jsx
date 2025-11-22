import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show navigation on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkStyle = (path) => ({
    padding: '10px 15px',
    textDecoration: 'none',
    color: isActive(path) ? '#007bff' : '#333',
    backgroundColor: isActive(path) ? '#f0f8ff' : 'transparent',
    borderRadius: '4px',
    fontWeight: isActive(path) ? '600' : '400',
    transition: 'all 0.2s',
  });

  // Patient Navigation
  if (user.role === 'patient') {
    return (
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>
            <Link to="/patient-dashboard" style={styles.logoLink}>
              ThalAI Guardian
            </Link>
          </div>
          <div style={styles.navLinks}>
            <Link
              to="/patient-dashboard"
              style={navLinkStyle('/patient-dashboard')}
            >
              Dashboard
            </Link>
            <Link
              to="/patient-dashboard"
              style={navLinkStyle('/patient-dashboard')}
              onClick={(e) => {
                e.preventDefault();
                if (window.setPatientTab) {
                  window.setPatientTab('request');
                }
                navigate('/patient-dashboard');
              }}
            >
              Create Request
            </Link>
            <Link
              to="/patient-dashboard"
              style={navLinkStyle('/patient-dashboard')}
              onClick={(e) => {
                e.preventDefault();
                if (window.setPatientTab) {
                  window.setPatientTab('history');
                }
                navigate('/patient-dashboard');
              }}
            >
              My Requests
            </Link>
          </div>
          <div style={styles.userSection}>
            <span style={styles.userName}>{user.name}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // Donor Navigation
  if (user.role === 'donor') {
    return (
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>
            <Link to="/donor-dashboard" style={styles.logoLink}>
              ThalAI Guardian
            </Link>
          </div>
          <div style={styles.navLinks}>
            <Link
              to="/donor-dashboard"
              style={navLinkStyle('/donor-dashboard')}
            >
              Dashboard
            </Link>
            <Link
              to="/donor-dashboard"
              style={navLinkStyle('/donor-dashboard')}
            >
              Availability
            </Link>
          </div>
          <div style={styles.userSection}>
            <span style={styles.userName}>{user.name}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  // Admin Navigation
  if (user.role === 'admin') {
    return (
      <nav style={styles.nav}>
        <div style={styles.navContainer}>
          <div style={styles.logo}>
            <Link to="/admin-dashboard" style={styles.logoLink}>
              ThalAI Guardian
            </Link>
          </div>
          <div style={styles.navLinks}>
            <Link
              to="/admin-dashboard"
              style={navLinkStyle('/admin-dashboard')}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/donor-verification"
              style={navLinkStyle('/admin/donor-verification')}
            >
              Donors
            </Link>
            <Link
              to="/admin/requests"
              style={navLinkStyle('/admin/requests')}
            >
              Requests
            </Link>
          </div>
          <div style={styles.userSection}>
            <span style={styles.userName}>{user.name}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return null;
};

const styles = {
  nav: {
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '60px',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  logoLink: {
    textDecoration: 'none',
    color: '#007bff',
  },
  navLinks: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  userName: {
    color: '#666',
    fontSize: '14px',
  },
  logoutBtn: {
    padding: '8px 16px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default Navigation;

