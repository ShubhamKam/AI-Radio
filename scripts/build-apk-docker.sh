#!/bin/bash

# AI Radio APK Build Script using Docker
# No local Android SDK required!

set -e

echo "🐳 AI Radio Docker APK Build"
echo "============================"

# Create output directory
mkdir -p ./output

# Build Docker image
echo "📦 Building Docker image..."
docker build -t ai-radio-builder -f Dockerfile.android .

# Run build in container
echo "🔨 Building APK in container..."
docker run --rm -v "$(pwd)/output:/output" ai-radio-builder

echo ""
echo "✅ Build complete!"
echo "📱 APK location: ./output/ai-radio-debug.apk"
