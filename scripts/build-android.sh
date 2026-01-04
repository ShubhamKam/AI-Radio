#!/bin/bash

# AI Radio App - Android APK Build Script

set -e

echo "🎙️ AI Radio App - Android APK Build"
echo "===================================="
echo ""

# Check if Android Studio / SDK is installed
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME not set. Please install Android Studio and set ANDROID_HOME."
    echo "   On Linux/Mac: export ANDROID_HOME=~/Android/Sdk"
    echo "   On Windows: set ANDROID_HOME=C:\\Users\\YourUser\\AppData\\Local\\Android\\Sdk"
    echo ""
fi

# Navigate to frontend directory
cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the web app
echo "🔨 Building web app..."
npm run build

# Initialize Capacitor if not already done
if [ ! -d "android" ]; then
    echo "🔧 Initializing Capacitor..."
    npx cap add android
fi

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Copy assets
npx cap copy android

echo ""
echo "✅ Android project is ready!"
echo ""
echo "To build APK:"
echo "  Option 1: Use Android Studio"
echo "    npx cap open android"
echo "    Then: Build > Build Bundle(s) / APK(s) > Build APK(s)"
echo ""
echo "  Option 2: Use Gradle (requires ANDROID_HOME)"
echo "    cd android"
echo "    ./gradlew assembleDebug"
echo "    APK location: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""

# Optional: Build debug APK automatically if gradle is available
if [ -f "android/gradlew" ] && [ ! -z "$ANDROID_HOME" ]; then
    echo "🤖 Building debug APK..."
    cd android
    chmod +x gradlew
    ./gradlew assembleDebug
    
    echo ""
    echo "✅ APK built successfully!"
    echo "   Location: $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    
    # Copy APK to root for easy access
    cp app/build/outputs/apk/debug/app-debug.apk ../../ai-radio-debug.apk
    echo "   Copied to: ai-radio-debug.apk"
    echo ""
fi

cd ..
