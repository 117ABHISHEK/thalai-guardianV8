# ThalAI ML Service - Transfusion Prediction Microservice

## Overview

Python Flask microservice for predicting next transfusion date for thalassemia patients using ML (LightGBM) with rule-based fallback.

## Setup

### 1. Create Virtual Environment

```bash
python -m venv venv
```

Activate the environment based on your shell:
- **Windows (PowerShell):** `.\venv\Scripts\Activate.ps1`
- **Windows (CMD):** `venv\Scripts\activate.bat`
- **Linux/macOS:** `source venv/bin/activate`

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Train Model (First Time)

```bash
python train_model.py
```

This will:
- Generate synthetic transfusion history data
- Prepare training features
- Train LightGBM model
- Save model to `models/transfusion_predictor.pkl`
- Generate model info and metrics

### 4. Start Service

```bash
python app.py
```

Service runs on `http://localhost:8000` by default.

## API Endpoints

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_version": "1.0.0",
  "timestamp": "2024-03-01T12:00:00"
}
```

### Model Info

```bash
GET /model-info
```

Returns model version, metrics, and feature importance.

### Predict Next Transfusion

```bash
POST /predict-next-transfusion
```

**Request Body:**
```json
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
```

**Response:**
```json
{
  "predictedNextDate": "2024-03-15",
  "confidence": 0.85,
  "explanation": "ML prediction based on: mean_interval_days (primary factor), mean interval 28.0 days, Hb trend -0.15",
  "method": "ml",
  "predictedDays": 28,
  "features": {...},
  "patientId": "patient_123"
}
```

**Rule-Based Fallback:**
If model is not available or insufficient data, falls back to rule-based prediction:
```json
{
  "predictedNextDate": "2024-03-15",
  "confidence": 0.75,
  "explanation": "Rule-based prediction: 28-day interval (mean: 27.5 days, adjusted for Hb 8.0 g/dL)",
  "method": "rule_based"
}
```

## Model Features

**Input Features:**
- `mean_interval_days` - Average days between transfusions
- `hb_trend` - Hemoglobin trend (slope)
- `units_per_transfusion_avg` - Average units per transfusion
- `days_since_last_transfusion` - Days since last transfusion
- `age` - Patient age
- `weightKg` - Patient weight
- `month` - Current month (seasonal)
- `day_of_week` - Day of week
- `has_comorbidities` - Boolean flag
- `last_hb` - Last hemoglobin value
- `last_units` - Last transfusion units

**Target:**
- `target_days_to_next` - Days until next transfusion (predicted)

## Training

The model is trained using LightGBM gradient boosting:

- **Objective:** Regression (predict days until next transfusion)
- **Metric:** MAE (Mean Absolute Error)
- **Early Stopping:** 50 rounds
- **Feature Engineering:** Automatic from transfusion history

**Training Command:**
```bash
python train_model.py
```

**Model Evaluation:**
After training, check:
- `models/model_info.json` - Model metrics and feature importance
- Console output - MAE, RMSE, R², coverage metrics

## Rule-Based Fallback

When ML model is unavailable or insufficient data:

1. **No History:** Default 21-day interval
2. **Single Transfusion:** Interval based on Hb level (14-28 days)
3. **Multiple Transfusions:** Mean interval adjusted by current Hb level

**Hb-Based Adjustments:**
- Hb < 8.0 g/dL: -3 days (sooner transfusion)
- Hb > 10.0 g/dL: +3 days (can wait longer)

## Environment Variables

```env
PORT=8000  # Flask server port (default: 8000)
```

## Integration with Node.js Backend

```javascript
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

async function predictNextTransfusion(patientData) {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/predict-next-transfusion`,
      patientData
    );
    return response.data;
  } catch (error) {
    console.error('ML prediction error:', error);
    return null;
  }
}
```

## Testing

### Test Health Check

```bash
curl http://localhost:8000/health
```

### Test Prediction

```bash
curl -X POST http://localhost:8000/predict-next-transfusion \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "test_patient",
    "history": [
      {"date": "2024-01-15", "units": 2, "hb_value": 8.5},
      {"date": "2024-02-20", "units": 2, "hb_value": 8.2}
    ],
    "lastHb": 8.0,
    "age": 25,
    "weightKg": 50,
    "comorbidities": ["thalassemia"],
    "currentDate": "2024-03-01"
  }'
```

## Production Deployment

1. **Train model** and save to `models/` directory
2. **Set environment variables** (PORT, etc.)
3. **Use process manager** (gunicorn, uwsgi, or Docker)
4. **Enable caching** for predictions (optional)
5. **Monitor** model performance and retrain periodically

## Model Retraining

Retrain model when:
- New real data is available
- Model performance degrades
- Patient patterns change

```bash
python train_model.py  # Retrain with updated data
# Restart service to load new model
```

## Troubleshooting

**Model not loading:**
- Check `models/transfusion_predictor.pkl` exists
- Run `python train_model.py` to generate model
- Service will use rule-based fallback if model unavailable

**Prediction errors:**
- Check input format matches expected schema
- Ensure `history` array is properly formatted
- Check date formats are YYYY-MM-DD

**Low confidence:**
- More training data may be needed
- Check feature quality
- Consider feature engineering improvements

## License

Part of ThalAI Guardian project.
