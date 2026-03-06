#!/bin/bash

# Export production environment
export NODE_ENV=production

echo "------------------------------------------------"
echo "--- 🚀 Launching ThalAI Guardian All-in-One ---"
echo "------------------------------------------------"

# Debug: System Info
echo "📂 Current Directory: $(pwd)"
echo "🕒 Time: $(date)"
echo "💾 Memory Check:"
free -h || echo "free command not available"

# 1. Database Check
echo "🔍 Checking database status..."
cd /app/thalai-backend && npm run seed:safe 2>&1
DB_STATUS=$?
if [ $DB_STATUS -eq 0 ]; then
  echo "✅ Database ready."
else
  echo "❌ Database check/seed failed with status $DB_STATUS"
fi

# 2. Frontend Assets Check
echo "📁 Verifying Frontend distribution..."
if [ -d "/app/thalai-frontend/dist" ]; then
    echo "✅ Frontend dist folder found."
    ls /app/thalai-frontend/dist/index.html || echo "⚠️ index.html missing in dist!"
else
    echo "❌ Frontend dist folder NOT FOUND! Serving might fail."
fi

# 3. Start AI Service (Background)
echo "🧠 Starting AI Service (Gunicorn)..."
cd /app/thalai-ai-service
gunicorn -w 1 -b 0.0.0.0:8000 app:app --access-logfile - --error-logfile - &
AI_PID=$!
echo "📡 AI Service started (PID: $AI_PID)"

# 4. Start Backend API (Foreground)
echo "🔌 Starting Backend API on port ${PORT:-5000}..."
cd /app/thalai-backend
# Run node directly to avoid npm noise and ensure we catch the exit code
node server.js 2>&1
SERVER_STATUS=$?

echo "------------------------------------------------"
echo "❌ Backend API exited with status $SERVER_STATUS"
echo "------------------------------------------------"

# Kill AI service before exiting
kill $AI_PID
exit $SERVER_STATUS
