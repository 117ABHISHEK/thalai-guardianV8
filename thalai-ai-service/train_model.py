"""
Train a simple ML model for donor availability prediction
Generates synthetic data and trains a Random Forest model
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import pickle
import os
from datetime import datetime, timedelta
import random

def generate_synthetic_data(n_samples=1000):
    """Generate synthetic donor data"""
    np.random.seed(42)
    random.seed(42)
    
    data = []
    
    for i in range(n_samples):
        age = np.random.randint(18, 65)
        donation_frequency = np.random.randint(0, 20)
        
        # Last donation date (0-365 days ago)
        days_ago = np.random.randint(0, 365)
        last_donation = datetime.now() - timedelta(days=days_ago)
        
        region = random.choice(['north', 'south', 'east', 'west', 'central', 'unknown'])
        health_flags_count = np.random.randint(0, 3)
        
        # Calculate target availability score
        score = 50  # Base
        
        # Age factor
        if 25 <= age <= 45:
            score += 15
        elif 18 <= age < 25 or 45 < age <= 60:
            score += 10
        
        # Donation frequency
        if donation_frequency >= 10:
            score += 20
        elif donation_frequency >= 5:
            score += 15
        elif donation_frequency >= 2:
            score += 10
        
        # Recency (optimal: 56-90 days)
        if 56 <= days_ago <= 90:
            score += 15
        elif 30 <= days_ago < 56:
            score += 10
        elif 90 < days_ago <= 180:
            score += 5
        
        # Region factor
        region_scores = {
            'north': 5, 'south': 8, 'east': 6,
            'west': 7, 'central': 8, 'unknown': 3
        }
        score += region_scores.get(region, 3)
        
        # Health flags (negative)
        score -= health_flags_count * 5
        
        # Add some noise
        score += np.random.normal(0, 5)
        score = max(0, min(100, score))
        
        # Region encoding
        region_map = {
            'north': 0.2, 'south': 0.3, 'east': 0.25,
            'west': 0.25, 'central': 0.3, 'unknown': 0.2
        }
        region_factor = region_map[region]
        
        data.append({
            'age': age,
            'donation_frequency': donation_frequency,
            'days_since_last_donation': days_ago,
            'region_factor': region_factor,
            'health_flags_count': health_flags_count,
            'donation_rate': donation_frequency / max(age - 18, 1),
            'recency_score': max(0, 90 - days_ago) / 90,
            'availability_score': score / 100  # Normalize to 0-1
        })
    
    return pd.DataFrame(data)

def train_model():
    """Train the availability prediction model"""
    print("Generating synthetic data...")
    df = generate_synthetic_data(n_samples=2000)
    
    # Features
    feature_cols = [
        'age',
        'donation_frequency',
        'days_since_last_donation',
        'region_factor',
        'health_flags_count',
        'donation_rate',
        'recency_score'
    ]
    
    X = df[feature_cols].values
    y = df['availability_score'].values
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    print("Training Random Forest model...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    
    print(f"Training R² score: {train_score:.4f}")
    print(f"Test R² score: {test_score:.4f}")
    
    # Save model and scaler
    os.makedirs('models', exist_ok=True)
    
    with open('models/availability_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    with open('models/scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)
    
    print("Model saved to models/availability_model.pkl")
    print("Scaler saved to models/scaler.pkl")
    
    return model, scaler

if __name__ == '__main__':
    train_model()

