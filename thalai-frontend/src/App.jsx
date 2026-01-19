import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';

// Public Pages
import HomeDashboard from './pages/HomeDashboard';
import DonorsPage from './pages/DonorsPage';
import RequestsPage from './pages/RequestsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorRegister from './pages/DonorRegister';

// Protected Pages
import PatientDashboard from './pages/PatientDashboard';
import DonorDashboard from './pages/DonorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import DonorVerification from './pages/DonorVerification';
import AdminRequestManager from './pages/AdminRequestManager';
import DonorMatchResults from './pages/DonorMatchResults';
import DonorProfile from './pages/DonorProfile';
import BookAppointment from './pages/BookAppointment';

// Home component that redirects based on auth status
const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-blue"></div>
      </div>
    );
  }

  if (user) {
    const role = user.role;
    return <Navigate to={`/${role}-dashboard`} replace />;
  }

  return <HomeDashboard />;
};

// Dashboard route component
const DashboardRoute = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role;
  
  switch (role) {
    case 'patient':
      return <PatientDashboard />;
    case 'donor':
      return <DonorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navigation />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/donors" element={<DonorsPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/donor" element={<DonorRegister />} />
              
              {/* Protected Dashboard Routes */}
              <Route
                path="/patient-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['donor']}>
                    <DonorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/donor-profile"
                element={
                  <ProtectedRoute allowedRoles={['donor']}>
                    <DonorProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['doctor']}>
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Protected Feature Routes */}
              <Route
                path="/admin/donor-verification"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DonorVerification />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/requests"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminRequestManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/matches/:requestId"
                element={
                  <ProtectedRoute>
                    <DonorMatchResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/book-appointment"
                element={
                  <ProtectedRoute allowedRoles={['patient']}>
                    <BookAppointment />
                  </ProtectedRoute>
                }
              />
              
              {/* Generic dashboard route */}
              <Route path="/dashboard" element={<DashboardRoute />} />
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ChatbotWidget />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
