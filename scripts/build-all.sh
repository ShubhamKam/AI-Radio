#!/bin/bash

# Complete Build Script for AI Radio App

set -e

echo "🎙️ AI Radio App - Complete Build"
echo "=================================="
echo ""

# 1. Build backend
echo "📦 Building backend..."
cd /workspace/backend
npm run build
echo "✅ Backend built successfully"
echo ""

# 2. Build frontend
echo "📦 Building frontend..."
cd /workspace/frontend
npm run build
echo "✅ Frontend built successfully"
echo ""

# 3. Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android
echo "✅ Capacitor synced successfully"
echo ""

# 4. Build APK (if Android SDK is available)
if [ ! -z "$ANDROID_HOME" ] && [ -f "android/gradlew" ]; then
    echo "🤖 Building Android APK..."
    cd android
    chmod +x gradlew
    ./gradlew assembleDebug
    
    echo ""
    echo "✅ APK built successfully!"
    echo "   Location: $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    
    # Copy to root
    cp app/build/outputs/apk/debug/app-debug.apk /workspace/ai-radio-debug.apk
    echo "   Copied to: /workspace/ai-radio-debug.apk"
else
    echo "⚠️  Android SDK not configured. Skipping APK build."
    echo "   Set ANDROID_HOME and run:"
    echo "   cd /workspace/frontend/android && ./gradlew assembleDebug"
fi

echo ""
echo "✅ Build complete!"
echo ""
echo "Next steps:"
echo "  1. Set up environment variables in .env"
echo "  2. Start services: docker-compose up -d"
echo "  3. Install APK on device: adb install ai-radio-debug.apk"
echo ""
