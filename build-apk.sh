#!/bin/bash

echo "Building AI Radio APK..."

# Build frontend
echo "Building frontend..."
cd frontend
npm run build

# Sync Capacitor
echo "Syncing Capacitor..."
npx cap sync

# Build Android APK
echo "Building Android APK..."
cd android
./gradlew assembleRelease

echo "APK built successfully!"
echo "APK location: android/app/build/outputs/apk/release/app-release.apk"
