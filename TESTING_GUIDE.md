# Testing Guide for Android AI Agent

## Overview
This guide provides comprehensive testing procedures for the Android AI Agent application. Since the build environment doesn't have Java/Android SDK installed, this document outlines how to test the application once built on a proper Android development environment.

## Prerequisites for Testing

### Development Environment
1. **Android Studio** (Arctic Fox or later)
2. **JDK 17+** installed and configured
3. **Android SDK** with API 34
4. **Android Device or Emulator** (API 24+)

### API Keys Required
- OpenAI API Key (for GPT-4 testing)
- Google AI API Key (for Gemini testing)

## Build Verification

### Step 1: Initial Build
```bash
cd /path/to/AIAAgent
./gradlew clean
./gradlew assembleDebug
```

**Expected Output:**
- Build should complete without errors
- APK generated at: `app/build/outputs/apk/debug/app-debug.apk`

**Common Issues:**
- Missing dependencies: Run `./gradlew --refresh-dependencies`
- Kotlin version mismatch: Check `build.gradle.kts` versions
- SDK not found: Set `ANDROID_HOME` environment variable

### Step 2: Lint and Code Quality
```bash
./gradlew lint
./gradlew ktlintCheck  # If ktlint is configured
```

**Check for:**
- No critical lint errors
- Code style compliance
- Security warnings

## Functional Testing

### Test 1: Application Launch
**Objective:** Verify app launches successfully

**Steps:**
1. Install APK: `adb install app/build/outputs/apk/debug/app-debug.apk`
2. Launch app from device
3. Observe initial screen

**Expected Results:**
- App launches without crashes
- Chat screen displays with welcome message
- Settings icon visible in top bar
- Input field and Send button present

**Pass Criteria:**
- ✅ No crashes on launch
- ✅ UI elements render correctly
- ✅ Welcome message displays available tools

### Test 2: Settings Configuration
**Objective:** Verify API key configuration

**Steps:**
1. Tap settings icon (⚙️)
2. Enter OpenAI API key
3. Select OpenAI as provider
4. Tap "Save Settings"
5. Navigate back to chat

**Expected Results:**
- Settings screen opens
- API key input accepts text (masked)
- Provider selection works
- Settings persist after save
- No API key warning in chat

**Pass Criteria:**
- ✅ Settings save successfully
- ✅ API keys stored securely
- ✅ Provider selection updates

### Test 3: OpenAI Integration
**Objective:** Test OpenAI GPT-4 integration

**Test Cases:**

#### 3.1: Simple Query
**Input:** "Hello, how are you?"
**Expected:** AI responds with greeting
**Pass:** ✅ Response received within 10 seconds

#### 3.2: Tool Detection - Battery
**Input:** "What's my battery level?"
**Expected:** 
- Tool execution indicator appears
- Battery status displayed with percentage
- AI provides summary

**Pass:** 
- ✅ Tool call detected
- ✅ Battery info retrieved
- ✅ Formatted response displayed

#### 3.3: Tool Detection - App Launch
**Input:** "Open Chrome" or "Launch Gmail"
**Expected:**
- Tool execution indicator
- App launches
- Success message from AI

**Pass:**
- ✅ App launches successfully
- ✅ Confirmation message displayed

#### 3.4: Tool Detection - System Info
**Input:** "Tell me about my device"
**Expected:**
- System info tool executes
- Device details displayed (manufacturer, model, Android version)

**Pass:**
- ✅ System information retrieved
- ✅ Details accurate and formatted

### Test 4: Google AI Integration
**Objective:** Test Google Gemini integration

**Steps:**
1. Go to Settings
2. Enter Google AI API key
3. Select "Google Gemini" as provider
4. Save settings
5. Return to chat
6. Send test message: "Hello"

**Expected Results:**
- Provider switches successfully
- Google AI responds
- Tool detection works (may be limited)

**Pass Criteria:**
- ✅ Google AI responds
- ✅ No API errors
- ✅ Basic functionality works

### Test 5: Local Model
**Objective:** Test local model fallback

**Steps:**
1. Go to Settings
2. Select "Local Model" as provider
3. Return to chat
4. Send message: "Test local model"

**Expected Results:**
- Local model responds (placeholder message)
- No API key required
- Response indicates limited functionality

**Pass Criteria:**
- ✅ Local model responds
- ✅ No crashes
- ✅ Clear indication of limitations

### Test 6: Tool System
**Objective:** Verify all tools work correctly

#### 6.1: Get Installed Apps
**Input:** "What apps do I have?"
**Expected:** List of installed apps
**Pass:** ✅ Apps listed correctly

#### 6.2: Network Info
**Input:** "Check my network connection"
**Expected:** Network status (WiFi/Mobile/Ethernet)
**Pass:** ✅ Network info accurate

#### 6.3: Storage Info
**Input:** "How much storage do I have?"
**Expected:** Storage details (total, used, available)
**Pass:** ✅ Storage info displayed

#### 6.4: Calculator
**Input:** "Calculate 25 * 4 + 10"
**Expected:** Result: 110
**Pass:** ✅ Calculation correct

### Test 7: Error Handling
**Objective:** Verify error handling

**Test Cases:**

#### 7.1: Invalid API Key
**Steps:**
1. Enter invalid API key
2. Send message

**Expected:** Error message displayed
**Pass:** ✅ Clear error message, no crash

#### 7.2: No Internet
**Steps:**
1. Disable internet
2. Send message

**Expected:** Network error message
**Pass:** ✅ Appropriate error handling

#### 7.3: App Not Found
**Input:** "Launch NonExistentApp123"
**Expected:** Error message about app not found
**Pass:** ✅ Graceful error handling

### Test 8: UI/UX Testing
**Objective:** Verify user interface quality

**Checks:**
- ✅ Message bubbles display correctly
- ✅ User messages align right (blue)
- ✅ AI messages align left (gray)
- ✅ Tool execution messages distinct (orange/yellow)
- ✅ Timestamps show correctly
- ✅ Auto-scroll to latest message
- ✅ Input field expands for long text
- ✅ Loading indicator shows during processing
- ✅ Settings screen layout proper
- ✅ Navigation works smoothly

### Test 9: Conversation Context
**Objective:** Verify conversation history

**Steps:**
1. Send: "My name is John"
2. Send: "What's my name?"

**Expected:** AI remembers and responds "John"
**Pass:** ✅ Context maintained across messages

### Test 10: Performance Testing
**Objective:** Verify app performance

**Metrics:**
- App launch time: < 3 seconds
- Message send response: < 10 seconds (network dependent)
- Tool execution: < 2 seconds
- UI responsiveness: No lag
- Memory usage: < 200MB

**Pass Criteria:**
- ✅ No ANR (Application Not Responding)
- ✅ Smooth scrolling
- ✅ No memory leaks

## Integration Testing

### Test 11: Multi-Tool Workflow
**Objective:** Test complex multi-step interactions

**Scenario:**
1. "Check my battery"
2. "What's my network status?"
3. "How much storage do I have?"
4. "Launch Chrome"

**Expected:** All tools execute in sequence
**Pass:** ✅ All operations complete successfully

### Test 12: Provider Switching
**Objective:** Test switching between providers

**Steps:**
1. Use OpenAI, send message
2. Switch to Google AI in settings
3. Send another message
4. Switch to Local Model
5. Send message

**Expected:** Each provider responds appropriately
**Pass:** ✅ Smooth provider transitions

## Security Testing

### Test 13: API Key Security
**Objective:** Verify API keys are stored securely

**Checks:**
- ✅ API keys encrypted in storage
- ✅ Keys not visible in logs
- ✅ Keys masked in UI
- ✅ Secure transmission (HTTPS)

**Verification:**
```bash
adb shell run-as com.example.aiaagent
cd shared_prefs
cat ai_agent_prefs.xml
# Should see encrypted data, not plain text
```

### Test 14: Permissions
**Objective:** Verify permission handling

**Checks:**
- ✅ Internet permission granted
- ✅ Network state permission granted
- ✅ Query packages permission granted
- ✅ No unnecessary permissions requested

## Regression Testing

### Test 15: After Code Changes
**Checklist:**
- ✅ All previous tests still pass
- ✅ No new crashes introduced
- ✅ Performance not degraded
- ✅ UI still renders correctly

## Test Results Template

```
Test Date: [DATE]
Tester: [NAME]
Device: [DEVICE MODEL]
Android Version: [VERSION]
App Version: [VERSION]

Test Results:
[ ] Test 1: Application Launch - PASS/FAIL
[ ] Test 2: Settings Configuration - PASS/FAIL
[ ] Test 3: OpenAI Integration - PASS/FAIL
[ ] Test 4: Google AI Integration - PASS/FAIL
[ ] Test 5: Local Model - PASS/FAIL
[ ] Test 6: Tool System - PASS/FAIL
[ ] Test 7: Error Handling - PASS/FAIL
[ ] Test 8: UI/UX Testing - PASS/FAIL
[ ] Test 9: Conversation Context - PASS/FAIL
[ ] Test 10: Performance Testing - PASS/FAIL
[ ] Test 11: Multi-Tool Workflow - PASS/FAIL
[ ] Test 12: Provider Switching - PASS/FAIL
[ ] Test 13: API Key Security - PASS/FAIL
[ ] Test 14: Permissions - PASS/FAIL

Issues Found:
1. [Description]
2. [Description]

Notes:
[Additional observations]
```

## Debugging Tips

### View Logs
```bash
adb logcat | grep AIAAgent
```

### Check Crashes
```bash
adb logcat | grep AndroidRuntime
```

### Network Debugging
```bash
adb logcat | grep OkHttp
```

### Database Inspection
```bash
adb shell run-as com.example.aiaagent
cd databases
sqlite3 your_database.db
```

## Automated Testing (Future)

### Unit Tests
```bash
./gradlew test
```

### Instrumented Tests
```bash
./gradlew connectedAndroidTest
```

### UI Tests (Espresso)
```kotlin
@Test
fun testChatScreenDisplays() {
    onView(withId(R.id.chat_screen))
        .check(matches(isDisplayed()))
}
```

## Conclusion

This testing guide ensures comprehensive coverage of the Android AI Agent application. All tests should pass before considering the application production-ready. Regular regression testing is recommended after any code changes.

For issues or questions, refer to the main README.md or BUILD_INSTRUCTIONS.md files.
