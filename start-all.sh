#!/bin/bash
# Startup script for AdaptiveLearnAI with Quiz Platform integration

echo "🚀 Starting AdaptiveLearnAI with Quiz Platform..."
echo ""

# Check if MongoDB is running
echo "Checking MongoDB connection..."
if ! command -v mongod &> /dev/null && ! docker ps | grep -q mongodb; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first:"
    echo "   docker run -d -p 27017:27017 --name mongodb mongo:latest"
    echo "   or: mongod"
    exit 1
fi
echo "✓ MongoDB is accessible"
echo ""

# Start Python service
echo "Starting Python Quiz Platform Service..."
cd python-services/quiz_platform

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Start the service in background
python -m uvicorn api:app --reload --host 127.0.0.1 --port 8000 &
PYTHON_PID=$!
echo "✓ Python service started (PID: $PYTHON_PID)"
echo ""

# Go back to root
cd ../..

# Start Next.js
echo "Starting Next.js Application..."
npm run dev &
NEXT_PID=$!
echo "✓ Next.js app started (PID: $NEXT_PID)"
echo ""

echo "=========================================="
echo "✅ All services are running!"
echo "=========================================="
echo ""
echo "🌐 Application URLs:"
echo "   • Next.js:      http://localhost:9002"
echo "   • Python API:   http://localhost:8000"
echo "   • API Docs:     http://localhost:8000/docs"
echo ""
echo "📝 To stop all services, press Ctrl+C"
echo ""

# Wait for both processes
wait
