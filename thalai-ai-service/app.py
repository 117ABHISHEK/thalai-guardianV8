"""
Flask API for Thalassemia Transfusion Prediction
Provides ML-based prediction for next transfusion date
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables for model
model = None
model_info = None
feature_columns = None

def load_model():
    """Load the trained model and metadata"""
    global model, model_info, feature_columns
    
    model_path = os.path.join('models', 'transfusion_predictor.pkl')
    info_path = os.path.join('models', 'model_info.json')
    
    if not os.path.exists(model_path):
        print(f"Warning: Model not found at {model_path}. Using rule-based fallback.")
        return False
    
    try:
        model = joblib.load(model_path)
        with open(info_path, 'r') as f:
            model_info = json.load(f)
        feature_columns = model_info.get('feature_columns', [])
        print(f"Model loaded successfully. Version: {model_info.get('model_version', 'unknown')}")
        return True
    except Exception as e:
        print(f"Error loading model: {e}. Using rule-based fallback.")
        return False

def rule_based_prediction(history, last_hb, age, weight_kg, current_date):
    """
    Rule-based fallback prediction when model is unavailable
    Uses simple heuristics based on transfusion history
    """
    if not history or len(history) < 1:
        # Default: predict in 21 days if no history
        next_date = datetime.strptime(current_date, '%Y-%m-%d') + timedelta(days=21)
        return {
            'predictedNextDate': next_date.strftime('%Y-%m-%d'),
            'confidence': 0.5,
            'explanation': 'Rule-based prediction: Default 21-day interval (insufficient history)',
            'method': 'rule_based',
        }
    
    # Sort history by date
    sorted_history = sorted(history, key=lambda x: x.get('date', ''))
    
    if len(sorted_history) < 2:
        # Single transfusion: use typical interval based on Hb
        if last_hb < 8.0:
            interval_days = 14  # Low Hb, frequent transfusions
        elif last_hb < 9.0:
            interval_days = 21
        else:
            interval_days = 28
        
        last_date = datetime.strptime(sorted_history[-1]['date'], '%Y-%m-%d')
        next_date = last_date + timedelta(days=interval_days)
        
        return {
            'predictedNextDate': next_date.strftime('%Y-%m-%d'),
            'confidence': 0.6,
            'explanation': f'Rule-based prediction: {interval_days}-day interval based on Hb level ({last_hb:.1f} g/dL)',
            'method': 'rule_based',
        }
    
    # Calculate mean interval from history
    intervals = []
    for i in range(1, len(sorted_history)):
        prev_date = datetime.strptime(sorted_history[i-1]['date'], '%Y-%m-%d')
        curr_date = datetime.strptime(sorted_history[i]['date'], '%Y-%m-%d')
        interval = (curr_date - prev_date).days
        intervals.append(interval)
    
    mean_interval = np.mean(intervals)
    
    # Adjust based on last Hb
    if last_hb < 8.0:
        adjustment = -3  # Need sooner transfusion
    elif last_hb > 10.0:
        adjustment = 3  # Can wait longer
    else:
        adjustment = 0
    
    predicted_interval = max(7, mean_interval + adjustment)  # Minimum 7 days
    
    last_date = datetime.strptime(sorted_history[-1]['date'], '%Y-%m-%d')
    next_date = last_date + timedelta(days=int(predicted_interval))
    
    return {
        'predictedNextDate': next_date.strftime('%Y-%m-%d'),
        'confidence': 0.75,
        'explanation': f'Rule-based prediction: {int(predicted_interval)}-day interval (mean: {mean_interval:.1f} days, adjusted for Hb {last_hb:.1f} g/dL)',
        'method': 'rule_based',
    }

def prepare_features(history, last_hb, age, weight_kg, comorbidities, current_date):
    """
    Prepare features for model prediction
    """
    if not history or len(history) < 1:
        return None  # Insufficient data
    
    # Sort history by date
    sorted_history = sorted(history, key=lambda x: x.get('date', ''))
    
    # Compute mean interval
    if len(sorted_history) >= 2:
        intervals = []
        for i in range(1, len(sorted_history)):
            prev_date = datetime.strptime(sorted_history[i-1]['date'], '%Y-%m-%d')
            curr_date = datetime.strptime(sorted_history[i]['date'], '%Y-%m-%d')
            interval = (curr_date - prev_date).days
            intervals.append(interval)
        mean_interval = np.mean(intervals)
    else:
        mean_interval = 21  # Default
    
    # Compute Hb trend (slope)
    hb_values = [h.get('hb_value', last_hb) for h in sorted_history]
    if len(hb_values) >= 2:
        hb_trend = np.polyfit(range(len(hb_values)), hb_values, 1)[0]
    else:
        hb_trend = 0
    
    # Average units per transfusion
    units = [h.get('units', 1) for h in sorted_history]
    avg_units = np.mean(units)
    
    # Days since last transfusion
    last_transfusion_date = datetime.strptime(sorted_history[-1]['date'], '%Y-%m-%d')
    current_dt = datetime.strptime(current_date, '%Y-%m-%d')
    days_since_last = (current_dt - last_transfusion_date).days
    
    # Current month and day of week
    month = current_dt.month
    day_of_week = current_dt.weekday()
    
    # Has comorbidities
    has_comorbidities = 1 if comorbidities and len(comorbidities) > 0 else 0
    
    # Last transfusion data
    last_transfusion = sorted_history[-1]
    last_units = last_transfusion.get('units', 1)
    
    # Create feature vector
    features = pd.DataFrame([{
        'mean_interval_days': mean_interval,
        'hb_trend': hb_trend,
        'units_per_transfusion_avg': avg_units,
        'days_since_last_transfusion': days_since_last,
        'age': age,
        'weightKg': weight_kg,
        'month': month,
        'day_of_week': day_of_week,
        'has_comorbidities': has_comorbidities,
        'last_hb': last_hb,
        'last_units': last_units,
    }])
    
    return features

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_version': model_info.get('model_version', 'unknown') if model_info else None,
        'timestamp': datetime.now().isoformat(),
    })

@app.route('/model-info', methods=['GET'])
def model_info_endpoint():
    """Get model information"""
    if not model_info:
        return jsonify({
            'error': 'Model not loaded',
            'fallback': 'rule_based',
        }), 404
    
    return jsonify({
        'model_version': model_info.get('model_version'),
        'trained_at': model_info.get('trained_at'),
        'metrics': model_info.get('metrics'),
        'feature_importance': model_info.get('feature_importance'),
    })

@app.route('/predict-next-transfusion', methods=['POST'])
def predict_next_transfusion():
    """
    Predict next transfusion date for a patient
    
    Request Body:
    {
        "patientId": "patient_123",
        "history": [
            {"date": "2024-01-15", "units": 2, "hb_value": 8.5},
            {"date": "2024-02-20", "units": 2, "hb_value": 8.2}
        ],
        "lastHb": 8.0,
        "age": 25,
        "weightKg": 50,
        "comorbidities": ["thalassemia"],
        "currentDate": "2024-03-01"
    }
    
    Response:
    {
        "predictedNextDate": "2024-03-15",
        "confidence": 0.85,
        "explanation": "...",
        "method": "ml" or "rule_based",
        "features": {...}
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['history', 'lastHb', 'age', 'weightKg', 'currentDate']
        missing_fields = [f for f in required_fields if f not in data]
        
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400
        
        # Extract data
        history = data.get('history', [])
        last_hb = float(data['lastHb'])
        age = int(data['age'])
        weight_kg = float(data['weightKg'])
        comorbidities = data.get('comorbidities', [])
        current_date = data['currentDate']
        patient_id = data.get('patientId', 'unknown')
        
        # Extract Thalassemia specific parameters (optional)
        ferritin = float(data.get('ferritin', 0)) if data.get('ferritin') else None
        sgpt = float(data.get('sgpt', 0)) if data.get('sgpt') else None
        sgot = float(data.get('sgot', 0)) if data.get('sgot') else None
        creatinine = float(data.get('creatinine', 0)) if data.get('creatinine') else None
        
        # Prepare features
        features = prepare_features(history, last_hb, age, weight_kg, comorbidities, current_date)
        
        # Add extra parameters to features for response/logging
        if features is not None:
            if ferritin is not None: features['ferritin'] = ferritin
            if sgpt is not None: features['sgpt'] = sgpt
            if sgot is not None: features['sgot'] = sgot
            if creatinine is not None: features['creatinine'] = creatinine
        
        # Use ML model if available and sufficient data, otherwise use rule-based
        if model is not None and features is not None:
            try:
                # Ensure features match model expectations
                features_aligned = features[feature_columns]
                
                # Make prediction
                predicted_days = model.predict(features_aligned)[0]
                predicted_days = max(7, predicted_days)  # Minimum 7 days
                
                # Calculate predicted date
                last_transfusion_date = datetime.strptime(history[-1]['date'], '%Y-%m-%d')
                predicted_date = last_transfusion_date + timedelta(days=int(predicted_days))
                
                # Get feature importance for explanation
                feature_importance = model_info.get('feature_importance', {})
                
                # Generate explanation
                top_features = sorted(
                    feature_importance.items(),
                    key=lambda x: x[1],
                    reverse=True
                )[:3]
                
                explanation = f'ML prediction based on: {top_features[0][0]} (primary factor), mean interval {features["mean_interval_days"].iloc[0]:.1f} days, Hb trend {features["hb_trend"].iloc[0]:.2f}'
                
                # Confidence based on model performance
                confidence = 0.85  # Based on test MAE coverage
                
                return jsonify({
                    'predictedNextDate': predicted_date.strftime('%Y-%m-%d'),
                    'confidence': confidence,
                    'explanation': explanation,
                    'method': 'ml',
                    'predictedDays': int(predicted_days),
                    'features': features.iloc[0].to_dict(),
                    'patientId': patient_id,
                })
            except Exception as e:
                print(f"ML prediction error: {e}. Falling back to rule-based.")
                # Fall through to rule-based
        
        # Rule-based fallback
        result = rule_based_prediction(history, last_hb, age, weight_kg, current_date)
        result['patientId'] = patient_id
        return jsonify(result)
        
    except Exception as e:
        print(f"Prediction error: {e}")
        return jsonify({
            'error': f'Prediction failed: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Load model on startup
    print("Loading transfusion prediction model...")
    model_loaded = load_model()
    
    if not model_loaded:
        print("Using rule-based fallback for predictions.")
    
    # Start server
    port = int(os.getenv('PORT', 8000))
    print(f"\nStarting ThalAI ML Service on port {port}...")
    print(f"Health check: http://localhost:{port}/health")
    print(f"Prediction endpoint: http://localhost:{port}/predict-next-transfusion")
    
    app.run(host='0.0.0.0', port=port, debug=False)
