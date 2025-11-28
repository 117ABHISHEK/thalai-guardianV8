import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../api/auth';
import HealthMetricsForm from '../components/HealthMetricsForm';
import { getDonorProfile } from '../api/donor';

/**
 * Donor Profile Page with Eligibility Status Display
 * Shows eligibility status, next possible donation date, and donation history
 */
const DonorProfile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [donorProfile, setDonorProfile] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHealthMetricsEdit, setShowHealthMetricsEdit] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      setUser(response.data.user);

      // Fetch donor profile if user is a donor
      if (response.data.user.role === 'donor') {
        try {
          const donorResponse = await getDonorProfile();
          setDonorProfile(donorResponse.data.donor);
          setEligibility(donorResponse.data.eligibility);
        } catch (err) {
          console.error('Error fetching donor profile:', err);
          // Donor profile might not exist yet
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const getEligibilityBadgeClass = (status) => {
    switch (status) {
      case 'eligible':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'ineligible':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'deferred':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleHealthMetricsUpdate = async (data) => {
    try {
      setUpdating(true);
      await updateProfile(data);
      await fetchProfile(); // Refresh data
      setShowHealthMetricsEdit(false);
    } catch (err) {
      console.error('Failed to update health metrics:', err);
      // You might want to show an error message here
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'donor') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card p-6 text-center">
          <p className="text-gray-600">This page is only available for donors.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Donor Profile</h1>

        {/* Eligibility Status Card */}
        {eligibility && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Eligibility Status</h2>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className={`inline-block px-4 py-2 rounded-lg border-2 font-semibold ${getEligibilityBadgeClass(eligibility.eligible ? 'eligible' : donorProfile?.eligibilityStatus || 'deferred')}`}>
                  {eligibility.eligible ? '✓ Eligible' : donorProfile?.eligibilityStatus?.toUpperCase() || 'DEFERRED'}
                </span>
              </div>
              <div>
                {eligibility.nextPossibleDate && (
                  <p className="text-sm text-gray-600">
                    Next Possible Donation: <strong className="text-health-blue">{formatDate(eligibility.nextPossibleDate)}</strong>
                  </p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Reason:</strong> {eligibility.reason || donorProfile?.eligibilityReason || 'Pending review'}
              </p>
            </div>

            {/* Eligibility Checks */}
            {eligibility.checks && (
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold text-gray-900">Eligibility Checks:</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  <div className={`p-3 rounded ${eligibility.checks.ageCheck?.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className="text-sm">
                      {eligibility.checks.ageCheck?.passed ? '✓' : '✗'} Age Check: {eligibility.checks.ageCheck?.passed ? 'Passed' : eligibility.checks.ageCheck?.reason || 'Failed'}
                    </p>
                  </div>
                  <div className={`p-3 rounded ${eligibility.checks.donationIntervalCheck?.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className="text-sm">
                      {eligibility.checks.donationIntervalCheck?.passed ? '✓' : '✗'} Donation Interval: {eligibility.checks.donationIntervalCheck?.passed ? 'Passed' : eligibility.checks.donationIntervalCheck?.reason || 'Failed'}
                    </p>
                  </div>
                  <div className={`p-3 rounded ${eligibility.checks.medicalHistoryCheck?.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className="text-sm">
                      {eligibility.checks.medicalHistoryCheck?.passed ? '✓' : '✗'} Medical History: {eligibility.checks.medicalHistoryCheck?.passed ? 'Passed' : eligibility.checks.medicalHistoryCheck?.reason || 'Failed'}
                    </p>
                  </div>
                  <div className={`p-3 rounded ${eligibility.checks.healthClearanceCheck?.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className="text-sm">
                      {eligibility.checks.healthClearanceCheck?.passed ? '✓' : '✗'} Health Clearance: {eligibility.checks.healthClearanceCheck?.passed ? 'Passed' : eligibility.checks.healthClearanceCheck?.reason || 'Failed'}
                    </p>
                  </div>
                  <div className={`p-3 rounded ${eligibility.checks.verificationCheck?.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                    <p className="text-sm">
                      {eligibility.checks.verificationCheck?.passed ? '✓' : '✗'} Verification: {eligibility.checks.verificationCheck?.passed ? 'Passed' : eligibility.checks.verificationCheck?.reason || 'Failed'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Donor Information */}
        {donorProfile && (
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Donor Information</h2>
              <button
                onClick={() => setShowHealthMetricsEdit(!showHealthMetricsEdit)}
                className="text-sm text-health-blue hover:text-blue-800 font-medium"
              >
                {showHealthMetricsEdit ? 'Cancel Edit' : 'Edit Health Metrics'}
              </button>
            </div>

            {showHealthMetricsEdit ? (
              <HealthMetricsForm
                initialData={donorProfile}
                onSave={handleHealthMetricsUpdate}
                loading={updating}
              />
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Height</p>
                  <p className="font-semibold text-gray-900">{donorProfile.heightCm || 'N/A'} cm</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-semibold text-gray-900">{donorProfile.weightKg || 'N/A'} kg</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-semibold text-gray-900">{formatDate(donorProfile.dob || user.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Age</p>
                  <p className="font-semibold text-gray-900">
                    {donorProfile.dob || user.dateOfBirth
                      ? Math.floor((new Date() - new Date(donorProfile.dob || user.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
                      : 'N/A'}{' '}
                    years
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Donation Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(donorProfile.lastDonationDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Donations</p>
                  <p className="font-semibold text-gray-900">{donorProfile.totalDonations || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Donation Frequency</p>
                  <p className="font-semibold text-gray-900">{donorProfile.donationFrequencyMonths || 3} months</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Health Clearance</p>
                  <p className={`font-semibold ${donorProfile.healthClearance ? 'text-green-600' : 'text-yellow-600'}`}>
                    {donorProfile.healthClearance ? '✓ Granted' : 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Verification Status</p>
                  <p className={`font-semibold ${donorProfile.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {donorProfile.isVerified ? '✓ Verified' : 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Availability Status</p>
                  <p className={`font-semibold ${donorProfile.availabilityStatus ? 'text-green-600' : 'text-gray-600'}`}>
                    {donorProfile.availabilityStatus ? 'Available' : 'Not Available'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Medical Reports (New Section) */}
        {donorProfile?.medicalReports && donorProfile.medicalReports.length > 0 && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Medical Reports</h2>
            <div className="space-y-3">
              {donorProfile.medicalReports.map((report, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <span className="text-xs text-gray-500">{formatDate(report.reportDate)}</span>
                  </div>
                  {report.value && <p className="text-sm font-medium text-gray-800 mb-1">Result: {report.value}</p>}
                  {report.notes && <p className="text-sm text-gray-600">{report.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Donate Now Button */}
        {eligibility && (
          <div className="card p-6 mb-6">
            {eligibility.eligible && donorProfile?.healthClearance && donorProfile?.isVerified ? (
              <button className="btn-primary w-full py-3">
                Donate Now
              </button>
            ) : (
              <div className="text-center">
                <button disabled className="btn-primary w-full py-3 opacity-50 cursor-not-allowed">
                  Cannot Donate Now
                </button>
                <p className="mt-2 text-sm text-gray-600">
                  {!eligibility.eligible
                    ? eligibility.reason || 'You are not eligible to donate at this time.'
                    : 'Please wait for admin verification and health clearance.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Medical History */}
        {donorProfile?.medicalHistory && donorProfile.medicalHistory.length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Medical History</h2>
            <div className="space-y-3">
              {donorProfile.medicalHistory.map((entry, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{entry.condition}</h3>
                    {entry.isContraindication && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Contraindication</span>
                    )}
                  </div>
                  {entry.details && <p className="text-sm text-gray-600 mb-2">{entry.details}</p>}
                  {entry.diagnosisDate && (
                    <p className="text-xs text-gray-500">Diagnosed: {formatDate(entry.diagnosisDate)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorProfile;

