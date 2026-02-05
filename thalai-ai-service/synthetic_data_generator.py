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
    Generate medically advanced synthetic transfusion history data
    """
    np.random.seed(seed)
    random.seed(seed)
    
    data = []
    
    # Thalassemia types and their impact on transfusion frequency
    thal_types = {
        'Beta Thalassemia Major': {'freq': 21, 'freq_std': 3, 'units_base': 2},
        'E-Beta Thalassemia': {'freq': 28, 'freq_std': 5, 'units_base': 2},
        'Beta Thalassemia Intermedia': {'freq': 45, 'freq_std': 10, 'units_base': 1},
        'Alpha Thalassemia (HbH)': {'freq': 90, 'freq_std': 20, 'units_base': 1}
    }
    
    # Common thalassemia comorbidities
    comorbidities_list = [
        [],
        ['iron_overload'],
        ['iron_overload', 'hepatitis_c'],
        ['diabetes', 'hypothyroidism'],
        ['heart_disease', 'iron_overload'],
        ['osteoporosis'],
    ]
    
    for patient_id in range(1, n_patients + 1):
        # Patient characteristics
        age = np.random.randint(2, 65)
        weight = np.random.uniform(15, 95)
        thal_type = np.random.choice(list(thal_types.keys()), p=[0.5, 0.2, 0.2, 0.1])
        splenectomy = np.random.choice([True, False], p=[0.25, 0.75])
        comorbidities = random.choice(comorbidities_list)
        
        # Base transfusion settings
        t_info = thal_types[thal_type]
        base_interval = t_info['freq']
        if splenectomy:
            base_interval *= 1.3  # Splenectomy usually reduces transfusion requirements
        
        # Ferritin level (starts high if iron_overload)
        ferritin = np.random.uniform(500, 3000) if 'iron_overload' in comorbidities else np.random.uniform(200, 1000)
        
        # Generate 2-3 years of history
        current_date = datetime.now() - timedelta(days=np.random.randint(700, 1000))
        
        current_hb = np.random.uniform(9.0, 12.0)
        n_transfusions = 0
        
        while current_date < datetime.now():
            # Interval variability affected by comorbidities and age
            variability = np.random.normal(1.0, 0.1)
            if 'heart_disease' in comorbidities:
                variability *= 0.85 # Need transfusions more frequently
            
            interval = int(base_interval * variability + np.random.normal(0, t_info['freq_std']))
            interval = max(7, interval) # Minimum 1 week
            
            current_date += timedelta(days=interval)
            if current_date > datetime.now():
                break
                
            # Hb decay: Typically drops 1g/dL per week, slower if splenectomy
            decay_rate = np.random.uniform(0.7, 1.2)
            if splenectomy: decay_rate *= 0.8
            hb_before = current_hb - (interval / 7.0) * decay_rate
            hb_before = max(4.5, hb_before)
            
            # Clinical decision on units
            units = t_info['units_base']
            if hb_before < 7.0: units += 1
            if weight > 70: units += 1
            if age < 10: units = max(1, units - 1)
            
            # Hb increase: ~1.0 per unit (varies with weight)
            inc_per_unit = (70.0 / weight) * np.random.uniform(0.8, 1.1)
            hb_after = min(13.5, hb_before + (units * inc_per_unit))
            current_hb = hb_after
            
            # Iron accumulation
            ferritin += (units * 150) - np.random.uniform(50, 150) # Assuming chelation is 50-150 units effective
            ferritin = max(100, ferritin)

            data.append({
                'patientId': f'patient_{patient_id}',
                'date': current_date.strftime('%Y-%m-%d'),
                'units': round(float(units), 1),
                'hb_value': round(float(hb_before), 1),
                'age': age,
                'weightKg': round(float(weight), 1),
                'thalassemia_type': thal_type,
                'splenectomy': splenectomy,
                'ferritin': round(float(ferritin), 1),
                'comorbidities': ','.join(comorbidities) if comorbidities else 'none',
                'days_since_last_transfusion': interval,
            })
            n_transfusions += 1
            
    df = pd.DataFrame(data)
    df['date'] = pd.to_datetime(df['date'])
    return df

def prepare_training_features(df):
    """
    Prepare features for model training
    """
    patient_features = []
    
    # Simple label encoding for thalassemia type
    thal_map = {
        'Beta Thalassemia Major': 0,
        'E-Beta Thalassemia': 1,
        'Beta Thalassemia Intermedia': 2,
        'Alpha Thalassemia (HbH)': 3
    }
    
    for patient_id in df['patientId'].unique():
        patient_data = df[df['patientId'] == patient_id].sort_values('date')
        
        if len(patient_data) < 3:
            continue
        
        # Compute Hb trend and rolling features
        hb_values = patient_data['hb_value'].values
        intervals = patient_data['days_since_last_transfusion'].values
        units = patient_data['units'].values
        
        mean_interval = intervals.mean()
        avg_units = units.mean()
        
        for idx in range(1, len(patient_data) - 1):
            current_row = patient_data.iloc[idx]
            next_row = patient_data.iloc[idx + 1]
            
            # Feature extraction
            recent_hb = hb_values[:idx+1][-3:] # Last 3 Hb values
            recent_hb_avg = np.mean(recent_hb)
            
            days_to_next = (next_row['date'] - current_row['date']).days
            
            patient_features.append({
                'patientId': patient_id,
                'mean_interval_days': mean_interval,
                'hb_trend': np.polyfit(range(len(hb_values[:idx+1])), hb_values[:idx+1], 1)[0] if idx >= 1 else 0,
                'units_per_transfusion_avg': avg_units,
                'days_since_last_transfusion': current_row['days_since_last_transfusion'],
                'age': current_row['age'],
                'weightKg': current_row['weightKg'],
                'thal_encoded': thal_map.get(current_row['thalassemia_type'], 0),
                'splenectomy': 1 if current_row['splenectomy'] else 0,
                'ferritin': current_row['ferritin'],
                'last_hb': current_row['hb_value'],
                'last_units': current_row['units'],
                'recent_hb_avg': recent_hb_avg,
                'has_comorbidities': 1 if current_row['comorbidities'] != 'none' else 0,
                'target_days_to_next': days_to_next,
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

