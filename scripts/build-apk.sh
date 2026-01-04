#!/bin/bash

# AI Radio APK Build Script
# Prerequisites: Node.js 20, Android SDK, Java 17

set -e

echo "🚀 AI Radio APK Build Script"
echo "=========================="

# Check prerequisites
check_prereqs() {
    echo "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is not installed"
        exit 1
    fi
    
    if ! command -v java &> /dev/null; then
        echo "❌ Java is not installed"
        exit 1
    fi
    
    if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
        echo "❌ ANDROID_HOME or ANDROID_SDK_ROOT is not set"
        echo "   Please install Android SDK and set the environment variable"
        exit 1
    fi
    
    echo "✅ All prerequisites met"
}

# Build frontend
build_frontend() {
    echo ""
    echo "📦 Building frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
}

# Sync Capacitor
sync_capacitor() {
    echo ""
    echo "🔄 Syncing Capacitor..."
    cd frontend
    npx cap sync android
    cd ..
}

# Build APK
build_apk() {
    echo ""
    echo "🔨 Building APK..."
    cd frontend/android
    
    # Make gradlew executable
    chmod +x gradlew
    
    # Build debug APK
    ./gradlew assembleDebug
    
    # Copy APK to project root
    cp app/build/outputs/apk/debug/app-debug.apk ../../ai-radio-debug.apk
    
    cd ../..
    
    echo ""
    echo "✅ APK built successfully!"
    echo "📱 Location: ./ai-radio-debug.apk"
}

# Main
main() {
    check_prereqs
    build_frontend
    sync_capacitor
    build_apk
    
    echo ""
    echo "🎉 Build complete!"
    echo ""
    echo "To install on device:"
    echo "  adb install ai-radio-debug.apk"
    echo ""
    echo "Or transfer the APK to your Android device and install manually."
}

main
