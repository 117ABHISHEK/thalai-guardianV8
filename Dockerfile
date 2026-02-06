# Base Image with both Python and Node.js support
FROM nikolaik/python-nodejs:python3.11-nodejs20

WORKDIR /app

# 1. Install AI Service dependencies
COPY thalai-ai-service/requirements.txt ./thalai-ai-service/
RUN pip install --no-cache-dir -r thalai-ai-service/requirements.txt

# 2. Build Frontend
COPY thalai-frontend/package*.json ./thalai-frontend/
RUN cd thalai-frontend && npm install
COPY thalai-frontend/ ./thalai-frontend/
# Set build-time env vars if needed
ARG VITE_API_URL=/api
ARG VITE_AI_SERVICE_URL=http://localhost:8000
RUN cd thalai-frontend && npm run build

# 3. Setup Backend
COPY thalai-backend/package*.json ./thalai-backend/
RUN cd thalai-backend && npm install --production
COPY thalai-backend/ ./thalai-backend/

# 4. Copy AI Service code
COPY thalai-ai-service/ ./thalai-ai-service/

# Expose ports
# Backend on 5000, AI on 8000
EXPOSE 5000
EXPOSE 8000

# Create a start script
RUN echo '#!/bin/bash\n\
cd /app/thalai-ai-service && gunicorn -w 2 -b 0.0.0.0:8000 app:app & \n\
cd /app/thalai-backend && npm start' > /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
