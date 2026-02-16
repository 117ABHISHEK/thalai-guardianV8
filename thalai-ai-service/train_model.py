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

def train_model(n_patients=2000, test_size=0.15, random_state=42):
    """
    Train enhanced LightGBM model for transfusion prediction
    """
    print("=" * 60)
    print("Training Enhanced Transfusion Prediction Model")
    print("=" * 60)
    
    # Generate synthetic data
    print(f"\n1. Generating advanced clinical data for {n_patients} patients...")
    df = generate_synthetic_transfusion_history(n_patients=n_patients, seed=random_state)
    print(f"   Generated {len(df)} transfusion records")
    
    # Prepare training features
    print("\n2. Preparing clinical training features...")
    training_df = prepare_training_features(df)
    print(f"   Prepared {len(training_df)} training samples")
    
    # Feature columns
    feature_columns = [
        'mean_interval_days',
        'hb_trend',
        'units_per_transfusion_avg',
        'days_since_last_transfusion',
        'age',
        'weightKg',
        'thal_encoded',
        'splenectomy',
        'ferritin',
        'last_hb',
        'last_units',
        'recent_hb_avg',
        'has_comorbidities',
    ]
    
    X = training_df[feature_columns]
    y = training_df['target_days_to_next']
    
    # Split data
    print("\n3. Splitting data into train/test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )
    
    # Advanced LightGBM parameters for better accuracy
    params = {
        'objective': 'regression',
        'metric': 'mae',
        'boosting_type': 'gbdt',
        'num_leaves': 64,
        'learning_rate': 0.03,
        'feature_fraction': 0.8,
        'bagging_fraction': 0.7,
        'bagging_freq': 5,
        'lambda_l1': 0.1,
        'lambda_l2': 0.1,
        'verbosity': -1,
        'random_state': random_state,
    }
    
    # Create LightGBM datasets
    train_data = lgb.Dataset(X_train, label=y_train)
    test_data = lgb.Dataset(X_test, label=y_test, reference=train_data)
    
    # Train model
    print("\n4. Training Enhanced LightGBM model with early stopping...")
    model = lgb.train(
        params,
        train_data,
        valid_sets=[train_data, test_data],
        valid_names=['train', 'eval'],
        num_boost_round=2000,
        callbacks=[
            lgb.early_stopping(stopping_rounds=100, verbose=True),
            lgb.log_evaluation(period=200)
        ]
    )
    
    # Make predictions
    print("\n5. Evaluating model accuracy...")
    y_pred_test = model.predict(X_test, num_iteration=model.best_iteration)
    
    # Calculate metrics
    test_mae = mean_absolute_error(y_test, y_pred_test)
    test_rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    test_r2 = r2_score(y_test, y_pred_test)
    
    metrics = {
        'test': {
            'mae': test_mae,
            'rmse': test_rmse,
            'r2': test_r2,
        },
        'coverage_7_days': float(np.mean(np.abs(y_test - y_pred_test) <= 7)),
        'coverage_14_days': float(np.mean(np.abs(y_test - y_pred_test) <= 14)),
    }
    
    print(f"\n   Test MAE: {test_mae:.2f} days (Average error)")
    print(f"   Test RMSE: {test_rmse:.2f} days")
    print(f"   Test R² Score: {test_r2:.4f}")
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
    model, feature_importance, metrics = train_model(n_patients=2000, random_state=42)
