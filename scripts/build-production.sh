#!/bin/bash

# AI Radio App - Production Build Script

set -e

echo "🎙️ AI Radio App - Production Build"
echo "===================================="
echo ""

# Build Docker image
echo "🐳 Building Docker image..."
docker build -t ai-radio-app:latest .

# Tag image with version
VERSION=$(date +%Y%m%d-%H%M%S)
docker tag ai-radio-app:latest ai-radio-app:$VERSION

echo "✅ Docker image built successfully!"
echo "   Latest: ai-radio-app:latest"
echo "   Version: ai-radio-app:$VERSION"
echo ""
echo "To run in production:"
echo "  docker-compose up -d"
echo ""
