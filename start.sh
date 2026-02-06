#!/bin/bash

# Export production environment
export NODE_ENV=production

# Start the AI Service in the background
echo "Starting AI Service..."
cd /app/thalai-ai-service && gunicorn -w 2 -b 0.0.0.0:8000 app:app &

# Start the Backend in the foreground
echo "Starting Backend API..."
cd /app/thalai-backend && npm start
