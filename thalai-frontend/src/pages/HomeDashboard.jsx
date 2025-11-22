import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPublicStats } from '../api/public';
import StatCard from '../components/StatCard';
import PublicStats from './PublicStats';
import DonorPreview from './DonorPreview';
import RequestPreview from './RequestPreview';

const HomeDashboard = () => {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getPublicStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            ThalAI Guardian
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Intelligent blood donor matching system for Thalassemia patients.
            Powered by AI to save lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="btn-primary text-lg px-8 py-3 inline-block"
                >
                  Become a Donor
                </Link>
                <Link
                  to="/login"
                  className="bg-white text-health-blue border-2 border-health-blue hover:bg-blue-50 font-semibold text-lg px-8 py-3 rounded-lg transition-colors inline-block"
                >
                  Patient Login
                </Link>
              </>
            ) : (
              <Link
                to="/patient-dashboard"
                className="btn-primary text-lg px-8 py-3 inline-block"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {!loading && stats && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <PublicStats stats={stats} />
        </section>
      )}

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center animate-slide-up">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Smart Matching</h3>
            <p className="text-gray-600">
              AI-powered algorithm matches patients with compatible donors based on location, availability, and history.
            </p>
          </div>
          <div className="card text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Fast Response</h3>
            <p className="text-gray-600">
              Real-time notifications ensure urgent requests get immediate attention from nearby donors.
            </p>
          </div>
          <div className="card text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-2">Verified Donors</h3>
            <p className="text-gray-600">
              All donors are verified and tracked to ensure safe and reliable blood donations.
            </p>
          </div>
        </div>
      </section>

      {/* Preview Sections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          <DonorPreview />
          <RequestPreview />
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-health-blue to-primary-500 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of donors helping thalassemia patients
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="bg-white text-health-blue hover:bg-gray-100 font-bold text-lg px-8 py-3 rounded-lg transition-colors inline-block"
            >
              Register as Donor
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomeDashboard;

