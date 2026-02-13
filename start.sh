#!/bin/bash

# Export production environment
export NODE_ENV=production

# Database Seeding (Only if empty)
echo "Checking database status..."
cd /app/thalai-backend && npm run seed:safe

# Debug: Check frontend files
echo "Current directory: $(pwd)"
echo "Listing frontend build:"
ls -R /app/thalai-frontend/dist || echo "❌ Dist folder missing!"

# Start the AI Service in the background
echo "Starting AI Service..."
cd /app/thalai-ai-service && gunicorn -w 2 -b 0.0.0.0:8000 app:app &

# Start the Backend in the foreground
echo "Starting Backend API..."
cd /app/thalai-backend && npm start
