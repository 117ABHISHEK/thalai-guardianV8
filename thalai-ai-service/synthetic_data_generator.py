"""
Synthetic Data Generator for Thalassemia Patient Transfusion History
Generates realistic transfusion patterns for model training
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_synthetic_transfusion_history(n_patients=100, seed=42):
    """
    Generate synthetic transfusion history data for training ML model
    
    Parameters:
    -----------
    n_patients : int
        Number of patients to generate data for
    seed : int
        Random seed for reproducibility
    
    Returns:
    --------
    pd.DataFrame
        DataFrame with columns: patientId, date, units, hb_value, age, weightKg, comorbidities
    """
    np.random.seed(seed)
    random.seed(seed)
    
    data = []
    
    # Common thalassemia comorbidities
    comorbidities_list = [
        [],
        ['iron_overload'],
        ['iron_overload', 'hepatitis'],
        ['diabetes'],
        ['heart_disease'],
        ['iron_overload', 'diabetes'],
    ]
    
    for patient_id in range(1, n_patients + 1):
        # Patient characteristics
        age = np.random.randint(5, 50)  # Age range for thalassemia patients
        weight = np.random.uniform(20, 80)  # Weight in kg
        comorbidities = random.choice(comorbidities_list)
        
        # Determine base transfusion interval (varies by patient)
        # Thalassemia patients typically need transfusions every 2-4 weeks
        base_interval_days = np.random.choice([14, 21, 28, 30, 35], p=[0.2, 0.3, 0.3, 0.15, 0.05])
        
        # Variability in interval (some patients have irregular patterns)
        interval_variability = np.random.uniform(0.7, 1.3)
        
        # Generate 12-24 months of history
        start_date = datetime.now() - timedelta(days=365 * 2)
        current_date = start_date
        
        # Initial Hb value (thalassemia patients typically have low Hb)
        current_hb = np.random.uniform(7.0, 9.5)
        
        # Generate transfusion history
        n_transfusions = 0
        max_transfusions = np.random.randint(12, 24)
        
        while n_transfusions < max_transfusions and current_date < datetime.now():
            # Calculate interval with some variability
            interval = int(base_interval_days * interval_variability * np.random.uniform(0.8, 1.2))
            current_date += timedelta(days=interval)
            
            if current_date > datetime.now():
                break
            
            # Hb value before transfusion (decreases over time)
            # Hb drops between transfusions (typically 1-2 g/dL over 2-4 weeks)
            hb_before = current_hb - np.random.uniform(0.5, 2.0)
            hb_before = max(5.0, min(10.0, hb_before))  # Keep in realistic range
            
            # Units transfused (typically 1-3 units)
            units = np.random.choice([1, 2, 3], p=[0.2, 0.6, 0.2])
            
            # Hb value after transfusion (increases by ~1 g/dL per unit)
            hb_after = min(12.0, hb_before + (units * np.random.uniform(0.8, 1.2)))
            current_hb = hb_after
            
            # Some seasonal variation (more transfusions needed in winter/infections)
            month = current_date.month
            if month in [12, 1, 2]:  # Winter months
                units = min(3, units + 0.5)
            
            # Age and weight affect transfusion needs
            if age < 18:  # Children may need adjusted units
                units = max(1, units - 0.5)
            
            data.append({
                'patientId': f'patient_{patient_id}',
                'date': current_date.strftime('%Y-%m-%d'),
                'units': round(units, 1),
                'hb_value': round(hb_before, 1),  # Hb before transfusion
                'age': age,
                'weightKg': round(weight, 1),
                'comorbidities': ','.join(comorbidities) if comorbidities else 'none',
                'days_since_last_transfusion': interval,
            })
            
            n_transfusions += 1
        
        # Update patient age over time (simple approximation)
        # In real implementation, this would be more accurate
    
    df = pd.DataFrame(data)
    
    # Add computed features
    df['date'] = pd.to_datetime(df['date'])
    df['month'] = df['date'].dt.month
    df['day_of_week'] = df['date'].dt.dayofweek
    
    return df

def prepare_training_features(df):
    """
    Prepare features for model training
    
    Parameters:
    -----------
    df : pd.DataFrame
        DataFrame with transfusion history
    
    Returns:
    --------
    pd.DataFrame
        DataFrame with engineered features
    """
    # Group by patient to compute patient-level features
    patient_features = []
    
    for patient_id in df['patientId'].unique():
        patient_data = df[df['patientId'] == patient_id].sort_values('date')
        
        if len(patient_data) < 2:
            continue  # Need at least 2 transfusions to compute interval
        
        # Compute mean interval
        intervals = patient_data['days_since_last_transfusion'].values[1:]  # Skip first
        mean_interval = intervals.mean()
        
        # Compute Hb trend (slope)
        hb_values = patient_data['hb_value'].values
        if len(hb_values) >= 2:
            hb_trend = np.polyfit(range(len(hb_values)), hb_values, 1)[0]  # Linear slope
        else:
            hb_trend = 0
        
        # Average units per transfusion
        avg_units = patient_data['units'].mean()
        
        # For each transfusion (except last), predict next date
        for idx in range(len(patient_data) - 1):
            current_row = patient_data.iloc[idx]
            next_row = patient_data.iloc[idx + 1]
            
            # Days since last transfusion at this point
            days_since_last = current_row['days_since_last_transfusion'] if idx > 0 else mean_interval
            
            # Target: actual next transfusion date
            actual_next_date = next_row['date']
            days_to_next = (actual_next_date - current_row['date']).days
            
            patient_features.append({
                'patientId': patient_id,
                'current_date': current_row['date'],
                'last_hb': current_row['hb_value'],
                'last_units': current_row['units'],
                'mean_interval_days': mean_interval,
                'hb_trend': hb_trend,
                'units_per_transfusion_avg': avg_units,
                'days_since_last_transfusion': days_since_last,
                'age': current_row['age'],
                'weightKg': current_row['weightKg'],
                'month': current_row['month'],
                'day_of_week': current_row['day_of_week'],
                'target_days_to_next': days_to_next,  # Target variable
                'has_comorbidities': 1 if current_row['comorbidities'] != 'none' else 0,
            })
    
    return pd.DataFrame(patient_features)

if __name__ == '__main__':
    print("Generating synthetic transfusion history data...")
    df = generate_synthetic_transfusion_history(n_patients=200)
    print(f"Generated {len(df)} transfusion records for {df['patientId'].nunique()} patients")
    
    print("\nPreparing training features...")
    training_df = prepare_training_features(df)
    print(f"Prepared {len(training_df)} training samples")
    
    # Save to CSV for training
    training_df.to_csv('training_data.csv', index=False)
    print("\nTraining data saved to training_data.csv")
    
    # Display sample
    print("\nSample data:")
    print(training_df.head())

