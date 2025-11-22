# ThalAI Guardian - AI Prediction Microservice

Python Flask microservice for predicting donor availability.

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Train the model
python train_model.py

# Run the service
python app.py
```

## Endpoints

### Health Check
```
GET /health
```

### Predict Availability
```
POST /predict-availability
Content-Type: application/json

{
  "donorId": "donor_id",
  "age": 30,
  "donationFrequency": 5,
  "lastDonationDate": "2024-01-15",
  "region": "north",
  "healthFlags": []
}
```

## Deployment

```bash
# Using Gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

## Environment Variables

```env
PORT=5001
```

