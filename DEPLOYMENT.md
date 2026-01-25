# Deployment Guide

## ✅ GitHub Repository Setup

**Repository**: https://github.com/ShubhamKam/AI-Radio

The code has been successfully pushed to GitHub with the following setup:

### Branch Structure
- **main**: Primary development and release branch
- All commits are tracked and versioned

### Automated CI/CD

#### 1. Continuous Integration (android-build.yml)
**Triggers**: 
- Every push to `main` branch
- Pull requests to `main`
- Manual workflow dispatch

**Actions**:
- Sets up JDK 17 with Gradle caching
- Builds both Debug and Release APKs
- Uploads APK artifacts for download
- Creates automatic releases with version tags

**Artifacts Available**:
- `app-debug.apk` - Debug build with logging
- `app-release-unsigned.apk` - Release build (unsigned)

#### 2. Release Workflow (release.yml)
**Triggers**:
- Git tags matching `v*` pattern
- Manual workflow dispatch with version input

**Actions**:
- Builds optimized release APK
- Creates GitHub release with detailed changelog
- Attaches APK files to release
- Generates release notes automatically

## 📥 Getting the APK

### Method 1: Download from Releases (Recommended)
1. Visit: https://github.com/ShubhamKam/AI-Radio/releases
2. Download the latest APK file
3. Install on your Android device

### Method 2: Download from GitHub Actions
1. Go to: https://github.com/ShubhamKam/AI-Radio/actions
2. Click on the latest successful workflow run
3. Scroll to "Artifacts" section
4. Download `app-debug` or `app-release`

### Method 3: Trigger Manual Build
1. Go to: https://github.com/ShubhamKam/AI-Radio/actions
2. Select "Android CI - Build APK" workflow
3. Click "Run workflow" button
4. Wait for build to complete
5. Download artifacts

## 🚀 Creating a New Release

### Automatic Release (on push)
Every push to `main` automatically creates a release with version `v1.0.<run_number>`

### Manual Release
```bash
# Create and push a version tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

This will trigger the release workflow and create a GitHub release.

### Using GitHub UI
1. Go to: https://github.com/ShubhamKam/AI-Radio/actions
2. Select "Create Release APK" workflow
3. Click "Run workflow"
4. Enter version (e.g., v1.0.0)
5. Click "Run workflow" button

## 📱 Installing the APK

### On Android Device
1. Download APK to your device
2. Open Settings → Security
3. Enable "Install from Unknown Sources" or "Install Unknown Apps"
4. Locate the downloaded APK in your file manager
5. Tap to install
6. Follow installation prompts
7. Launch the app

### Using ADB (Developer)
```bash
# Install debug APK
adb install app-debug.apk

# Install release APK
adb install app-release-unsigned.apk

# Install with replacement
adb install -r app-debug.apk
```

## 🔐 Code Signing (Optional)

For production releases, you should sign the APK:

### 1. Create Keystore
```bash
keytool -genkey -v -keystore release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias ai-agent-key
```

### 2. Add Secrets to GitHub
Go to: https://github.com/ShubhamKam/AI-Radio/settings/secrets/actions

Add these secrets:
- `KEYSTORE_FILE`: Base64 encoded keystore file
- `KEYSTORE_PASSWORD`: Keystore password
- `KEY_ALIAS`: Key alias name
- `KEY_PASSWORD`: Key password

### 3. Encode Keystore
```bash
base64 release-key.jks > keystore.base64
# Copy contents and add as KEYSTORE_FILE secret
```

### 4. Update Workflow
The release workflow already includes signing logic that activates when secrets are present.

## 📊 Build Status

Check build status at: https://github.com/ShubhamKam/AI-Radio/actions

Badges in README show:
- [![Android CI](https://github.com/ShubhamKam/AI-Radio/actions/workflows/android-build.yml/badge.svg)](https://github.com/ShubhamKam/AI-Radio/actions/workflows/android-build.yml)
- [![Release](https://img.shields.io/github/v/release/ShubhamKam/AI-Radio)](https://github.com/ShubhamKam/AI-Radio/releases)

## 🔄 Continuous Deployment Flow

```
Developer Push → GitHub → Actions Triggered → Build APK → Upload Artifacts → Create Release
```

1. Developer pushes code to `main`
2. GitHub Actions automatically triggered
3. JDK 17 environment set up
4. Gradle builds Debug and Release APKs
5. APKs uploaded as artifacts
6. GitHub release created with APKs attached
7. Users can download from Releases page

## 🛠️ Troubleshooting

### Build Fails
- Check Actions logs: https://github.com/ShubhamKam/AI-Radio/actions
- Verify Gradle configuration
- Ensure all dependencies are available
- Check for syntax errors in workflow files

### APK Won't Install
- Enable "Install from Unknown Sources"
- Check Android version (minimum API 24)
- Verify APK is not corrupted
- Try uninstalling previous version first

### Workflow Not Triggering
- Verify push is to `main` branch
- Check workflow file syntax
- Ensure Actions are enabled in repository settings
- Review branch protection rules

## 📝 Version Management

Current versioning scheme:
- **Automatic**: `v1.0.<github_run_number>`
- **Manual**: `v<major>.<minor>.<patch>`

Example versions:
- v1.0.1 - First automatic build
- v1.0.2 - Second automatic build
- v1.1.0 - Manual feature release
- v2.0.0 - Manual major release

## 🎯 Next Steps

1. **Test the Build**: Download APK from Actions and test on device
2. **Create First Release**: Tag v1.0.0 for official first release
3. **Add Signing**: Set up keystore and secrets for signed releases
4. **Monitor Builds**: Watch Actions for any build failures
5. **Update Documentation**: Keep README and guides current

## 📞 Support

- **Issues**: https://github.com/ShubhamKam/AI-Radio/issues
- **Actions**: https://github.com/ShubhamKam/AI-Radio/actions
- **Releases**: https://github.com/ShubhamKam/AI-Radio/releases

---

**Status**: ✅ Deployment pipeline active and ready
**Last Updated**: January 25, 2026
