"""
ThalAI Guardian - AI Prediction Microservice
Predicts donor availability based on historical data
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)

# Load trained model (will be created by train_model.py)
MODEL_PATH = 'models/availability_model.pkl'
SCALER_PATH = 'models/scaler.pkl'

model = None
scaler = None

def load_model():
    """Load the trained model and scaler"""
    global model, scaler
    try:
        if os.path.exists(MODEL_PATH):
            with open(MODEL_PATH, 'rb') as f:
                model = pickle.load(f)
        else:
            print("Model not found. Using default prediction.")
            model = None
        
        if os.path.exists(SCALER_PATH):
            with open(SCALER_PATH, 'rb') as f:
                scaler = pickle.load(f)
        else:
            scaler = None
    except Exception as e:
        print(f"Error loading model: {e}")
        model = None
        scaler = None

def calculate_days_since_last_donation(last_donation_date):
    """Calculate days since last donation"""
    if not last_donation_date:
        return 365  # Default to 1 year if no donation history
    
    try:
        if isinstance(last_donation_date, str):
            last_date = datetime.fromisoformat(last_donation_date.replace('Z', '+00:00'))
        else:
            last_date = last_donation_date
        
        days = (datetime.now() - last_date.replace(tzinfo=None)).days
        return max(0, days)
    except:
        return 365

def predict_availability(donor_data):
    """
    Predict donor availability score (0-100)
    
    Features:
    - age: Donor age
    - donation_frequency: Number of donations
    - days_since_last_donation: Days since last donation
    - region_factor: Regional factor (encoded)
    - health_flags_count: Number of health flags
    """
    age = donor_data.get('age', 30)
    donation_frequency = donor_data.get('donationFrequency', 0)
    last_donation_date = donor_data.get('lastDonationDate')
    region = donor_data.get('region', 'unknown')
    health_flags = donor_data.get('healthFlags', [])
    
    # Calculate days since last donation
    days_since = calculate_days_since_last_donation(last_donation_date)
    
    # Region encoding (simple hash-based)
    region_map = {
        'north': 0.2,
        'south': 0.3,
        'east': 0.25,
        'west': 0.25,
        'central': 0.3,
        'unknown': 0.2
    }
    region_factor = region_map.get(region.lower(), 0.2)
    
    # Health flags count
    health_flags_count = len(health_flags) if health_flags else 0
    
    # Feature engineering
    features = np.array([[
        age,
        donation_frequency,
        days_since,
        region_factor,
        health_flags_count,
        # Derived features
        donation_frequency / max(age - 18, 1),  # Donation rate
        max(0, 90 - days_since) / 90,  # Recency score
    ]])
    
    # Scale features if scaler available
    if scaler:
        features = scaler.transform(features)
    
    # Predict using model or fallback
    if model:
        try:
            prediction = model.predict(features)[0]
            # Ensure score is between 0-100
            score = max(0, min(100, prediction * 100))
        except:
            score = calculate_fallback_score(age, donation_frequency, days_since)
    else:
        score = calculate_fallback_score(age, donation_frequency, days_since)
    
    return round(score, 2)

def calculate_fallback_score(age, donation_frequency, days_since):
    """Fallback scoring algorithm if model not available"""
    score = 50  # Base score
    
    # Age factor (optimal: 25-45)
    if 25 <= age <= 45:
        score += 15
    elif 18 <= age < 25 or 45 < age <= 60:
        score += 10
    else:
        score += 5
    
    # Donation frequency factor
    if donation_frequency >= 10:
        score += 20
    elif donation_frequency >= 5:
        score += 15
    elif donation_frequency >= 2:
        score += 10
    elif donation_frequency >= 1:
        score += 5
    
    # Recency factor (optimal: 56-90 days)
    if 56 <= days_since <= 90:
        score += 15
    elif 30 <= days_since < 56:
        score += 10
    elif 90 < days_since <= 180:
        score += 5
    elif days_since > 180:
        score -= 5
    
    return max(0, min(100, score))

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'service': 'thalai-ai-prediction'
    })

@app.route('/predict-availability', methods=['POST'])
def predict():
    """Predict donor availability"""
    try:
        data = request.json
        
        if not data:
            return jsonify({
                'error': 'No data provided'
            }), 400
        
        # Extract donor data
        donor_data = {
            'age': data.get('age', 30),
            'donationFrequency': data.get('donationFrequency', 0),
            'lastDonationDate': data.get('lastDonationDate'),
            'region': data.get('region', 'unknown'),
            'healthFlags': data.get('healthFlags', [])
        }
        
        # Predict availability
        availability_score = predict_availability(donor_data)
        
        return jsonify({
            'success': True,
            'donorId': data.get('donorId'),
            'availabilityScore': availability_score,
            'confidence': 0.85 if model else 0.70,
            'model_used': 'trained' if model else 'fallback'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    load_model()
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)

