import { useState, useEffect } from 'react';
import { getTopMatches } from '../api/match';

const RequestMatchesModal = ({ requestId, onClose }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [requestId]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await getTopMatches(requestId);
      setMatches(data.data.matches);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-zoom-in">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Donor Matches</h2>
            <p className="text-sm text-gray-500 mt-1">Found {matches.length} matching donors for this request</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-health-blue mb-4"></div>
              <p className="text-gray-500 animate-pulse">Analyzing matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900">No matches found yet</h3>
              <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                We're continuing to look for donors who match your requirements. You'll be notified as soon as a match is found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Donor Details</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Blood Group</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Compatibility Score</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {matches.map((match) => (
                    <tr key={match.matchId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                            {match.donor?.name?.substring(0, 1) || 'D'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{match.donor?.name || 'Anonymous Donor'}</p>
                            <p className="text-xs text-gray-500">{match.donor?.address?.city || 'City'}, {match.donor?.address?.state || 'State'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-health-blue">
                        {match.donor?.bloodGroup}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 w-32">
                          <div className="flex justify-between items-center text-[10px] font-bold text-gray-600">
                            <span>Score</span>
                            <span>{match.matchScore}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                match.matchScore > 80 ? 'bg-green-500' : 
                                match.matchScore > 50 ? 'bg-blue-500' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${match.matchScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          match.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          match.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800 text-yellow-900 border border-yellow-200'
                        }`}>
                          {match.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {match.status === 'accepted' ? (
                          <a 
                            href={`tel:${match.donor?.phone}`}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 w-fit shadow-md shadow-green-100"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            Call Donor
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No contact yet</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="bg-health-blue text-white font-bold py-2.5 px-8 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestMatchesModal;
