import { useState, useEffect } from 'react';
import { getMyMatches, updateMatchStatus } from '../api/donor';
import { Search, Heart } from 'lucide-react';

const MatchedRequests = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await getMyMatches();
      setMatches(data.data.matches);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      setMessage('Failed to load matched requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (matchId, status) => {
    try {
      setUpdating(matchId);
      await updateMatchStatus(matchId, { status });
      setMessage(`Match ${status} successfully!`);
      // Re-fetch matches to update UI
      fetchMatches();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error(`Failed to ${status} match:`, error);
      setMessage(`Failed to ${status} match`);
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Failed') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          {message}
        </div>
      )}

      {matches.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center">
          <Search className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No Matched Requests Yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">
            When a patient's blood request matches your profile and location, it will appear here. Keep your availability active!
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {matches.map((match) => (
            <div key={match.matchId} className="card border-l-4 border-health-blue shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Match Score: {match.matchScore}%
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      match.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      match.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {match.status}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {match.request?.patientId?.name || 'Patient'} Needs Blood
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Blood Group</p>
                      <p className="font-bold text-health-blue">{match.request?.bloodGroup}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Units Needed</p>
                      <p className="font-bold text-gray-900">{match.request?.unitsRequired}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Urgency</p>
                      <p className={`font-bold ${
                        match.request?.urgency === 'critical' ? 'text-red-600' : 
                        match.request?.urgency === 'high' ? 'text-orange-600' : 
                        'text-blue-600'
                      }`}>
                        {match.request?.urgency}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-[10px] text-gray-500 uppercase font-bold">Location</p>
                      <p className="font-bold text-gray-900 truncate">
                        {match.request?.location?.city || 'City'}, {match.request?.location?.state || 'State'}
                      </p>
                    </div>
                  </div>

                  {match.request?.reason && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 italic">"{match.request.reason}"</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Requested on: {new Date(match.request?.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>Matched: {new Date(match.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {match.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(match.matchId, 'accepted')}
                        disabled={updating === match.matchId}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-green-200 active:scale-95 disabled:opacity-50"
                      >
                        {updating === match.matchId ? 'Updating...' : 'Accept Request'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(match.matchId, 'rejected')}
                        disabled={updating === match.matchId}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </>
                  ) : match.status === 'accepted' ? (
                    <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 flex flex-col items-center">
                      <Heart className="w-8 h-8 mb-1 fill-green-500" />
                      <p className="font-bold text-sm">Accepted!</p>
                      <p className="text-xs mt-1 text-center">Patient will be notified to contact you.</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 text-gray-500 p-4 rounded-xl border border-gray-100 italic">
                      Request Declined
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MatchedRequests;
