
import pandas as pd
import numpy as np
import joblib
import json
import os
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def evaluate_model():
    model_path = os.path.join('models', 'transfusion_predictor.pkl')
    info_path = os.path.join('models', 'model_info.json')
    data_path = 'training_data.csv'

    print("Generating fresh data for evaluation...")
    from synthetic_data_generator import generate_synthetic_transfusion_history, prepare_training_features
    df = generate_synthetic_transfusion_history(n_patients=500, seed=42)
    training_df = prepare_training_features(df)
    
    model = joblib.load(model_path)
    with open(info_path, 'r') as f:
        model_info = json.load(f)
    
    feature_columns = model_info.get('feature_columns', [])
    
    # Check if all feature columns are in the training_df
    missing = [c for c in feature_columns if c not in training_df.columns]
    if missing:
        print(f"Error: Missing columns in generated data: {missing}")
        return
    
    X = training_df[feature_columns]
    y = training_df['target_days_to_next']
    
    y_pred = model.predict(X)
    
    mae = mean_absolute_error(y, y_pred)
    rmse = np.sqrt(mean_squared_error(y, y_pred))
    r2 = r2_score(y, y_pred)
    
    print(f"\nModel Accuracy Evaluation:")
    print(f"--------------------------")
    print(f"Mean Absolute Error (MAE): {mae:.2f} days")
    print(f"Root Mean Squared Error (RMSE): {rmse:.2f} days")
    print(f"R2 Score: {r2:.4f}")
    
    # Calculate error within 3, 7, and 14 days
    diff = np.abs(y - y_pred)
    coverage_3 = np.mean(diff <= 3)
    coverage_7 = np.mean(diff <= 7)
    coverage_14 = np.mean(diff <= 14)
    
    print(f"Coverage (±3 days): {coverage_3:.1%}")
    print(f"Coverage (±7 days): {coverage_7:.1%}")
    print(f"Coverage (±14 days): {coverage_14:.1%}")

if __name__ == '__main__':
    evaluate_model()
