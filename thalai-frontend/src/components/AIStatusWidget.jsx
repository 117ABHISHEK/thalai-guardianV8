import { useState, useEffect } from 'react';
import { getAIStatus } from '../api/admin';

const AIStatusWidget = () => {
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIStatus();
    const interval = setInterval(fetchAIStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const fetchAIStatus = async () => {
    try {
      setLoading(true);
      const data = await getAIStatus();
      setAiStatus(data.data);
    } catch (error) {
      console.error('Failed to fetch AI status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !aiStatus) {
    return (
      <div className="card p-6 border-l-4 border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
      </div>
    );
  }

  const isOnline = aiStatus?.health?.status === 'healthy' || aiStatus?.health?.status === 'ok';

  return (
    <div className={`card border-l-4 ${isOnline ? 'border-green-500' : 'border-red-500'} shadow-sm`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">AI Service Health</h3>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          </div>
          <p className="text-sm text-gray-500">
            {isOnline ? 'Service is operational' : 'Service is unreachable'} • {aiStatus?.serviceUrl}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-400 uppercase font-bold">Status</p>
            <p className={`text-sm font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </p>
          </div>
          {isOnline && (
            <>
              <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Predictions Today</p>
                <p className="text-sm font-bold text-health-blue">{aiStatus.predictionStats?.totalPredictionsToday || 0}</p>
              </div>
              <div className="text-center px-4 py-2 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-400 uppercase font-bold">Active Models</p>
                <p className="text-sm font-bold text-gray-700">{aiStatus.predictionStats?.activeModels?.length || 0}</p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {isOnline && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2">INTEGRATED MODELS:</p>
          <div className="flex flex-wrap gap-2">
            {aiStatus.predictionStats?.activeModels?.map((model, idx) => (
              <span key={idx} className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded border border-blue-100">
                {model}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {!isOnline && aiStatus?.health?.error && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
          <p className="text-xs text-red-700 font-medium">Error: {aiStatus.health.error}</p>
        </div>
      )}
    </div>
  );
};

export default AIStatusWidget;
