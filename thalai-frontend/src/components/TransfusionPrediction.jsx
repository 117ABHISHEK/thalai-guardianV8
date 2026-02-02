import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Calendar } from 'lucide-react';

const TransfusionPrediction = ({ prediction, onRefresh, loading }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!prediction || !prediction.predictedDate) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Next Transfusion Prediction</h3>
            <p className="text-sm text-gray-600">
              {prediction?.explanation || 'Add transfusion records to get AI-powered predictions'}
            </p>
          </div>
          {onRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isRefreshing ? 'Calculating...' : 'Calculate Prediction'}
            </button>
          )}
        </div>
      </div>
    );
  }

  const predictedDate = new Date(prediction.predictedDate);
  const today = new Date();
  const daysUntil = Math.ceil((predictedDate - today) / (1000 * 60 * 60 * 24));
  
  // Determine urgency and colors
  let urgency = prediction.urgency || 'normal';
  if (!prediction.urgency) {
    if (daysUntil <= 3) urgency = 'urgent';
    else if (daysUntil <= 7) urgency = 'soon';
  }

  const urgencyConfig = {
    urgent: {
      gradient: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      icon: <AlertCircle className="w-8 h-8" />,
      label: 'Urgent'
    },
    soon: {
      gradient: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      icon: <AlertTriangle className="w-8 h-8" />,
      label: 'Soon'
    },
    normal: {
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      icon: <Calendar className="w-8 h-8" />,
      label: 'Scheduled'
    }
  };

  const config = urgencyConfig[urgency];
  const confidence = prediction.confidence || 0.5;
  const confidencePercent = Math.round(confidence * 100);

  return (
    <div className={`bg-gradient-to-r ${config.gradient} rounded-lg shadow-lg p-6 mb-6 text-white`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">{config.icon}</span>
            <div>
              <h3 className="text-xl font-bold">Next Transfusion Prediction</h3>
              <span className="text-sm opacity-90">{config.label}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-sm opacity-90 mb-1">Predicted Date</p>
              <p className="text-2xl font-bold">{predictedDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}</p>
              <p className="text-sm mt-1">
                {daysUntil > 0 ? `in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}` : 
                 daysUntil === 0 ? 'Today' : 
                 `${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''} overdue`}
              </p>
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-sm opacity-90 mb-2">Confidence Level</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white bg-opacity-30 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-white h-full rounded-full transition-all duration-500"
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>
                <span className="text-lg font-bold">{confidencePercent}%</span>
              </div>
              <p className="text-xs mt-1 opacity-75">
                {prediction.method === 'ml_model' ? 'ML Model' : 'Rule-based'}
              </p>
            </div>
          </div>

          {prediction.explanation && (
            <div className="bg-white bg-opacity-20 rounded-lg p-3 mb-3">
              <p className="text-sm">
                <span className="font-semibold">Explanation: </span>
                {prediction.explanation}
              </p>
            </div>
          )}

          {prediction.lastUpdated && (
            <p className="text-xs opacity-75">
              Last updated: {new Date(prediction.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>

        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="ml-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2"
            title="Recalculate prediction"
          >
            <svg 
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isRefreshing ? 'Updating...' : 'Refresh'}
          </button>
        )}
      </div>
    </div>
  );
};

export default TransfusionPrediction;
