import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-health-blue text-white p-2 rounded-lg">
              <span className="text-xl font-bold">🩸</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ThalAI Guardian</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive('/') 
                  ? 'bg-health-blue text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/donors"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive('/donors') 
                  ? 'bg-health-blue text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Donors
            </Link>
            <Link
              to="/requests"
              className={`px-4 py-2 rounded-lg transition-colors ${
                isActive('/requests') 
                  ? 'bg-health-blue text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Requests
            </Link>
            {isAuthenticated && (
              <Link
                to="/chatbot"
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isActive('/chatbot') 
                    ? 'bg-health-blue text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Chatbot
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 hidden md:block">
                  {user?.name}
                </span>
                <Link
                  to={`/${user?.role}-dashboard`}
                  className="btn-primary text-sm"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-health-blue font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

