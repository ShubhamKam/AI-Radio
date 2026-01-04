#!/bin/bash

# AI Radio App - Development Setup Script

set -e

echo "🎙️ AI Radio App - Development Setup"
echo "===================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp backend/.env.example .env
    echo "⚠️  Please update .env with your API keys before proceeding"
    echo ""
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/uploads backend/logs backend/data/postgres backend/data/redis frontend/dist

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

cd ..

# Start Docker containers
echo "🐳 Starting Docker containers..."
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Run database migrations
echo "🗃️  Running database migrations..."
cd backend
npx prisma migrate dev --name init || npx prisma db push

cd ..

echo ""
echo "✅ Development environment setup complete!"
echo ""
echo "To start the application:"
echo "  1. Backend:  cd backend && npm run dev"
echo "  2. Frontend: cd frontend && npm run dev"
echo ""
echo "Or use Docker:"
echo "  docker-compose -f docker-compose.dev.yml up"
echo ""
echo "Access the app at: http://localhost:5173"
echo "Backend API at: http://localhost:3000"
echo ""
