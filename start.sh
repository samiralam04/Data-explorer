#!/bin/bash

# Function to handle shutdown
cleanup() {
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap Ctrl+C (SIGINT) and call cleanup
trap cleanup SIGINT

echo "🚀 Starting Product Data Explorer..."

# 1. Start Database
echo "📦 Checking Database (Docker)..."
docker-compose up -d

# 2. Start Backend
echo "🔙 Starting Backend (Port 4001)..."
cd backend
# Ensure latest build
npm run build
# Start in background
PORT=4001 npm run start &
BACKEND_PID=$!

# Wait a moment for backend to initialize
sleep 5

# 3. Start Frontend
echo "🎨 Starting Frontend (Port 3000)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "✅ System is running!"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend:  http://localhost:4001"
echo "   - Swagger:  http://localhost:4001/api/docs"
echo ""
echo "Press Ctrl+C to stop everything."

# Wait for both processes
wait
