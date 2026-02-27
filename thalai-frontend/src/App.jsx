import { lazy, Suspense, useTransition, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Always-loaded (small, critical, needed on every page)
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';
import BackgroundDecoration from './components/BackgroundDecoration';
import PageLoader from './components/PageLoader';

// ─── Lazy-loaded Public Pages ─────────────────────────────────────────────────
const HomeDashboard   = lazy(() => import('./pages/HomeDashboard'));
const DonorsPage      = lazy(() => import('./pages/DonorsPage'));
const RequestsPage    = lazy(() => import('./pages/RequestsPage'));
const Login           = lazy(() => import('./pages/Login'));
const Register        = lazy(() => import('./pages/Register'));
const DonorRegister   = lazy(() => import('./pages/DonorRegister'));

// ─── Lazy-loaded Protected Pages ─────────────────────────────────────────────
const PatientDashboard    = lazy(() => import('./pages/PatientDashboard'));
const DonorDashboard      = lazy(() => import('./pages/DonorDashboard'));
const AdminDashboard      = lazy(() => import('./pages/AdminDashboard'));
const DoctorDashboard     = lazy(() => import('./pages/DoctorDashboard'));
const DonorVerification   = lazy(() => import('./pages/DonorVerification'));
const AdminRequestManager = lazy(() => import('./pages/AdminRequestManager'));
const DonorMatchResults   = lazy(() => import('./pages/DonorMatchResults'));
const DonorProfile        = lazy(() => import('./pages/DonorProfile'));
const BookAppointment     = lazy(() => import('./pages/BookAppointment'));
const SystemSettings      = lazy(() => import('./pages/SystemSettings'));
const AccountSettings     = lazy(() => import('./pages/AccountSettings'));

// ─── PageTransition ──────────────────────────────────────────────────────────
/**
 * Wraps the route tree and gives a smooth single fade whenever the route
 * (and therefore the lazy chunk) changes.
 *
 * Why this fixes the flicker:
 *  - Without this, the flow is: spinner pops in → spinner pops out → page
 *    content does its own animate-reveal from opacity 0. That's three
 *    visibility changes in < 400ms = the visible flicker.
 *  - With this wrapper, the entire <main> area fades to 0.92 opacity while
 *    the chunk loads, then seamlessly back to 1. The Suspense spinner is
 *    still there as a safety net for genuinely slow loads, but on a local
 *    dev server or cached production build users never see it.
 */
const PageTransition = ({ children }) => {
  const location = useLocation();
  const [isPending, startTransition] = useTransition();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('idle'); // 'idle' | 'out' | 'in'

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname ||
        location.search !== displayLocation.search) {
      // Begin fade-out
      setTransitionStage('out');
      const timer = setTimeout(() => {
        startTransition(() => {
          setDisplayLocation(location);
          setTransitionStage('in');
        });
      }, 120); // very short — just enough to not flicker
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    if (transitionStage === 'in') {
      const t = setTimeout(() => setTransitionStage('idle'), 350);
      return () => clearTimeout(t);
    }
  }, [transitionStage]);

  const opacity =
    transitionStage === 'out' ? 0 :
    transitionStage === 'in'  ? 0 : 1;

  return (
    <div
      style={{
        opacity,
        transition:
          transitionStage === 'out' ? 'opacity 120ms ease-out' :
          transitionStage === 'in'  ? 'opacity 300ms ease-in'  :
          'opacity 300ms ease-in',
      }}
    >
      {children}
    </div>
  );
};

// ─── Home – redirects based on auth status ────────────────────────────────────
const Home = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to={`/${user.role}-dashboard`} replace />;
  return <HomeDashboard />;
};

// ─── Generic /dashboard → role-specific dashboard ────────────────────────────
const DashboardRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'patient': return <PatientDashboard />;
    case 'donor':   return <DonorDashboard />;
    case 'admin':   return <AdminDashboard />;
    case 'doctor':  return <DoctorDashboard />;
    default:        return <Navigate to="/login" replace />;
  }
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col relative bg-transparent">
          <BackgroundDecoration />
          <Navigation />

          <main className="flex-grow w-full overflow-visible min-h-[70vh]">
            {/*
              Suspense is the safety-net for truly slow connections.
              PageTransition handles the smooth per-route fade so pages
              don't double-animate when chunks load quickly.
            */}
            <Suspense fallback={<PageLoader />}>
              <PageTransition>
                <Routes>
                  {/* ── Public ───────────────────────────────────────────── */}
                  <Route path="/"               element={<Home />} />
                  <Route path="/donors"         element={<DonorsPage />} />
                  <Route path="/requests"       element={<RequestsPage />} />
                  <Route path="/login"          element={<Login />} />
                  <Route path="/register"       element={<Register />} />
                  <Route path="/register/donor" element={<DonorRegister />} />

                  {/* ── Protected Dashboards ─────────────────────────────── */}
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

                  {/* ── Protected Features ───────────────────────────────── */}
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
                    path="/admin/settings"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <SystemSettings />
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
                      <ProtectedRoute allowedRoles={['patient', 'donor']}>
                        <BookAppointment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/account-settings"
                    element={
                      <ProtectedRoute>
                        <AccountSettings />
                      </ProtectedRoute>
                    }
                  />

                  {/* ── Redirects ────────────────────────────────────────── */}
                  <Route path="/emergency" element={<Navigate to="/requests"         replace />} />
                  <Route path="/settings"  element={<Navigate to="/account-settings" replace />} />
                  <Route path="/dashboard" element={<DashboardRoute />} />

                  {/* ── 404 ──────────────────────────────────────────────── */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </PageTransition>
            </Suspense>
          </main>

          <Footer className="flex-shrink-0" />
          <ChatbotWidget />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
