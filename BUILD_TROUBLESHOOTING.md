# Build Troubleshooting Guide

## Common Build Issues and Solutions

### Issue 1: Gradle Wrapper Properties Error
**Error**: Duplicate property in gradle-wrapper.properties
**Solution**: ✅ Fixed - Removed duplicate `zipStorePath` line

### Issue 2: Missing Launcher Icons
**Error**: `@mipmap/ic_launcher` not found
**Solution**: ✅ Fixed - Added adaptive icon XML files:
- `app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
- `app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`

### Issue 3: Missing Color Resources
**Error**: `@color/ic_launcher_background` not found
**Solution**: ✅ Fixed - Added `colors.xml` with required colors

### Issue 4: GitHub Actions Build Failures
**Solution**: ✅ Improved workflow with:
- Gradle version validation
- Clean build step
- Detailed logging with `--info` flag
- Conditional APK uploads
- Better error handling

## Verifying the Build

### Local Build (Requires Android SDK)
```bash
# Clean build
./gradlew clean

# Build debug APK
./gradlew assembleDebug --stacktrace

# Build release APK
./gradlew assembleRelease --stacktrace
```

### GitHub Actions Build
1. Visit: https://github.com/ShubhamKam/AI-Radio/actions
2. Check the latest workflow run
3. Review build logs for any errors
4. Download artifacts if build succeeds

## Build Requirements

### System Requirements
- JDK 17 or higher
- Android SDK API 34
- Gradle 8.4
- Minimum 4GB RAM
- 10GB free disk space

### Dependencies
All dependencies are managed by Gradle:
- Kotlin 1.9.10
- Compose BOM 2024.02.00
- Retrofit 2.9.0
- TensorFlow Lite 2.14.0
- Room 2.6.1

## Checking Build Status

### Via GitHub Actions
```bash
# Check latest workflow status
curl -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/ShubhamKam/AI-Radio/actions/runs?per_page=1
```

### Via Git
```bash
# Check if latest commit triggered build
git log -1 --oneline
```

## Common Error Messages

### Error: "JAVA_HOME is not set"
**Solution**: Install JDK 17 and set JAVA_HOME
```bash
# On Ubuntu/Debian
sudo apt install openjdk-17-jdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

### Error: "SDK location not found"
**Solution**: Create `local.properties` with SDK path
```properties
sdk.dir=/path/to/Android/Sdk
```

### Error: "Execution failed for task ':app:compileDebugKotlin'"
**Solution**: 
1. Clean build: `./gradlew clean`
2. Invalidate caches
3. Check Kotlin version compatibility
4. Review error logs for specific issues

### Error: "Could not resolve dependencies"
**Solution**:
1. Check internet connection
2. Clear Gradle cache: `rm -rf ~/.gradle/caches`
3. Sync project with Gradle files
4. Check repository URLs in `settings.gradle.kts`

## Build Artifacts

### Debug APK
- **Location**: `app/build/outputs/apk/debug/app-debug.apk`
- **Size**: ~15-20 MB
- **Features**: Logging enabled, debuggable

### Release APK
- **Location**: `app/build/outputs/apk/release/app-release-unsigned.apk`
- **Size**: ~10-15 MB (smaller due to optimization)
- **Features**: Optimized, ProGuard applied (if enabled)

## Monitoring Build Progress

### GitHub Actions Logs
1. Go to Actions tab
2. Click on latest workflow run
3. Expand build steps to see detailed logs
4. Look for red X marks indicating failures

### Key Build Steps
1. ✅ Checkout code
2. ✅ Set up JDK 17
3. ✅ Grant execute permission for gradlew
4. ✅ Validate Gradle wrapper
5. ✅ Clean build
6. ✅ Build Debug APK
7. ✅ Build Release APK
8. ✅ Upload artifacts
9. ✅ Create release (if on main branch)

## Testing the Build

### After Successful Build
1. Download APK from releases or artifacts
2. Install on Android device (API 24+)
3. Launch app and verify:
   - App opens without crashes
   - UI renders correctly
   - Settings screen accessible
   - Can enter API keys
   - Chat interface functional

### Smoke Test Commands
```bash
# Install APK
adb install app-debug.apk

# Launch app
adb shell am start -n com.example.aiaagent/.MainActivity

# Check logs
adb logcat | grep AIAAgent
```

## Getting Help

### If Build Still Fails
1. **Check Logs**: Review GitHub Actions logs for specific errors
2. **Verify Files**: Ensure all source files are committed
3. **Check Dependencies**: Verify all dependencies are accessible
4. **Test Locally**: Try building locally if possible
5. **Open Issue**: Create GitHub issue with error logs

### Useful Commands
```bash
# Check Gradle version
./gradlew --version

# List all tasks
./gradlew tasks

# Build with debug info
./gradlew assembleDebug --debug > build.log 2>&1

# Check for outdated dependencies
./gradlew dependencyUpdates
```

## Recent Fixes Applied

### Commit: f74089d
- ✅ Fixed gradle-wrapper.properties duplicate property
- ✅ Added launcher icon resources
- ✅ Added colors.xml
- ✅ Improved GitHub Actions workflow
- ✅ Added build validation steps
- ✅ Enhanced error handling

## Next Steps

1. **Monitor Build**: Check GitHub Actions for successful build
2. **Download APK**: Get APK from releases page
3. **Test Installation**: Install on Android device
4. **Report Issues**: Open GitHub issue if problems persist

## Build Status

**Latest Commit**: f74089d - "fix: resolve APK build issues"
**Expected Result**: ✅ Successful APK build
**Download**: https://github.com/ShubhamKam/AI-Radio/releases

---

**Last Updated**: January 25, 2026
**Status**: Build fixes applied and pushed to GitHub
