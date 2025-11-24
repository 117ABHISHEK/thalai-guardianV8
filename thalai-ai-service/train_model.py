"""
Train Transfusion Prediction Model
Uses LightGBM for predicting next transfusion date for thalassemia patients
"""

import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
from datetime import datetime
from synthetic_data_generator import generate_synthetic_transfusion_history, prepare_training_features

def train_model(n_patients=200, test_size=0.2, random_state=42):
    """
    Train LightGBM model for transfusion prediction
    
    Parameters:
    -----------
    n_patients : int
        Number of synthetic patients to generate
    test_size : float
        Test set size (0.2 = 20%)
    random_state : int
        Random seed for reproducibility
    
    Returns:
    --------
    model : LightGBM model
        Trained model
    feature_importance : dict
        Feature importance scores
    metrics : dict
        Model evaluation metrics
    """
    print("=" * 60)
    print("Training Transfusion Prediction Model")
    print("=" * 60)
    
    # Generate synthetic data
    print(f"\n1. Generating synthetic data for {n_patients} patients...")
    df = generate_synthetic_transfusion_history(n_patients=n_patients, seed=random_state)
    print(f"   Generated {len(df)} transfusion records")
    
    # Prepare training features
    print("\n2. Preparing training features...")
    training_df = prepare_training_features(df)
    print(f"   Prepared {len(training_df)} training samples")
    
    # Feature columns (excluding target and metadata)
    feature_columns = [
        'mean_interval_days',
        'hb_trend',
        'units_per_transfusion_avg',
        'days_since_last_transfusion',
        'age',
        'weightKg',
        'month',
        'day_of_week',
        'has_comorbidities',
        'last_hb',
        'last_units',
    ]
    
    X = training_df[feature_columns]
    y = training_df['target_days_to_next']  # Days until next transfusion
    
    # Split data
    print("\n3. Splitting data into train/test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    print(f"   Training samples: {len(X_train)}")
    print(f"   Test samples: {len(X_test)}")
    
    # LightGBM parameters
    params = {
        'objective': 'regression',
        'metric': 'mae',  # Mean Absolute Error
        'boosting_type': 'gbdt',
        'num_leaves': 31,
        'learning_rate': 0.05,
        'feature_fraction': 0.9,
        'bagging_fraction': 0.8,
        'bagging_freq': 5,
        'verbose': -1,
        'random_state': random_state,
    }
    
    # Create LightGBM datasets
    train_data = lgb.Dataset(X_train, label=y_train)
    test_data = lgb.Dataset(X_test, label=y_test, reference=train_data)
    
    # Train model
    print("\n4. Training LightGBM model...")
    model = lgb.train(
        params,
        train_data,
        valid_sets=[train_data, test_data],
        valid_names=['train', 'eval'],
        num_boost_round=1000,
        callbacks=[
            lgb.early_stopping(stopping_rounds=50, verbose=True),
            lgb.log_evaluation(period=100)
        ]
    )
    
    # Make predictions
    print("\n5. Evaluating model...")
    y_pred_train = model.predict(X_train, num_iteration=model.best_iteration)
    y_pred_test = model.predict(X_test, num_iteration=model.best_iteration)
    
    # Calculate metrics
    train_mae = mean_absolute_error(y_train, y_pred_train)
    test_mae = mean_absolute_error(y_test, y_pred_test)
    train_rmse = np.sqrt(mean_squared_error(y_train, y_pred_train))
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    train_r2 = r2_score(y_train, y_pred_train)
    test_r2 = r2_score(y_test, y_pred_test)
    
    metrics = {
        'train': {
            'mae': train_mae,
            'rmse': train_rmse,
            'r2': train_r2,
        },
        'test': {
            'mae': test_mae,
            'rmse': test_rmse,
            'r2': test_r2,
        },
        'coverage_7_days': np.mean(np.abs(y_test - y_pred_test) <= 7),  # Within 7 days
        'coverage_14_days': np.mean(np.abs(y_test - y_pred_test) <= 14),  # Within 14 days
    }
    
    print(f"\n   Training MAE: {train_mae:.2f} days")
    print(f"   Test MAE: {test_mae:.2f} days")
    print(f"   Test RMSE: {test_rmse:.2f} days")
    print(f"   Test R²: {test_r2:.3f}")
    print(f"   Coverage (±7 days): {metrics['coverage_7_days']:.1%}")
    print(f"   Coverage (±14 days): {metrics['coverage_14_days']:.1%}")
    
    # Feature importance
    feature_importance = dict(zip(feature_columns, model.feature_importance(importance_type='gain')))
    sorted_importance = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
    
    print("\n6. Feature Importance (Top 5):")
    for i, (feature, importance) in enumerate(sorted_importance[:5], 1):
        print(f"   {i}. {feature}: {importance:.2f}")
    
    # Save model
    os.makedirs('models', exist_ok=True)
    model_path = 'models/transfusion_predictor.pkl'
    joblib.dump(model, model_path)
    print(f"\n7. Model saved to {model_path}")
    
    # Save feature columns and importance
    model_info = {
        'feature_columns': feature_columns,
        'feature_importance': feature_importance,
        'metrics': metrics,
        'trained_at': datetime.now().isoformat(),
        'model_version': '1.0.0',
    }
    
    import json
    with open('models/model_info.json', 'w') as f:
        json.dump(model_info, f, indent=2)
    print(f"   Model info saved to models/model_info.json")
    
    print("\n" + "=" * 60)
    print("Training Complete!")
    print("=" * 60)
    
    return model, feature_importance, metrics

if __name__ == '__main__':
    model, feature_importance, metrics = train_model(n_patients=200, random_state=42)
