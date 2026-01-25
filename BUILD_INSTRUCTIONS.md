# Android AI Agent - Build Instructions

## Overview
This is a complete Android AI Agent application that integrates cloud AI models (OpenAI GPT, Google Gemini) and local AI capabilities with Android system tools through a chat-based interface.

## Prerequisites

### Required Software
1. **Java Development Kit (JDK) 17 or higher**
   - Download from: https://adoptium.net/ or https://www.oracle.com/java/technologies/downloads/
   - Set JAVA_HOME environment variable

2. **Android SDK**
   - Install Android Studio (recommended): https://developer.android.com/studio
   - Or install command-line tools: https://developer.android.com/studio#command-tools
   - Required SDK version: API 34 (Android 14)
   - Minimum SDK: API 24 (Android 7.0)

3. **Gradle** (included via wrapper)
   - The project includes Gradle wrapper scripts (gradlew/gradlew.bat)

## Building the Project

### On Linux/macOS:
```bash
cd /path/to/project
chmod +x gradlew
./gradlew assembleDebug
```

### On Windows:
```cmd
cd \path\to\project
gradlew.bat assembleDebug
```

### Build Output
The APK will be generated at:
```
app/build/outputs/apk/debug/app-debug.apk
```

## Installation

### Install on Device/Emulator:
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

### Or use Android Studio:
1. Open the project in Android Studio
2. Click "Run" (Shift+F10)
3. Select target device/emulator

## Configuration

### API Keys Setup
The app requires API keys for cloud AI providers:

1. **OpenAI API Key**
   - Get from: https://platform.openai.com/api-keys
   - Configure in app Settings screen

2. **Google AI API Key**
   - Get from: https://makersuite.google.com/app/apikey
   - Configure in app Settings screen

3. **Local Model** (Optional)
   - No API key required
   - Uses on-device processing (limited functionality)

## Features

### AI Providers
- **OpenAI GPT-4**: Advanced language model with function calling
- **Google Gemini Pro**: Google's latest AI model
- **Local Model**: On-device processing (placeholder implementation)

### Available Tools
1. **App Management**
   - Launch apps by name
   - List installed applications

2. **System Information**
   - Battery status and health
   - Network connectivity info
   - Storage usage details
   - Device system information

3. **Utilities**
   - Calculator for mathematical expressions
   - More tools can be easily added

### Chat Interface
- Material Design 3 UI
- Real-time message streaming
- Tool execution indicators
- Conversation history
- Error handling and recovery

## Architecture

### Technology Stack
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose with Material3
- **Architecture**: MVVM (Model-View-ViewModel)
- **Networking**: Retrofit + OkHttp
- **AI/ML**: TensorFlow Lite (for local models)
- **Storage**: Encrypted SharedPreferences
- **Async**: Kotlin Coroutines + Flow

### Project Structure
```
app/src/main/java/com/example/aiaagent/
├── data/
│   ├── api/              # API service interfaces
│   ├── model/            # Data models
│   ├── repository/       # Data repositories
│   └── service/          # AI service implementations
├── tools/                # Tool system and implementations
├── ui/                   # Compose UI screens
│   └── theme/           # Theme configuration
├── viewmodel/           # ViewModels
├── AIAgentApplication.kt
└── MainActivity.kt
```

## Permissions

The app requires the following permissions:
- `INTERNET`: For API calls to cloud AI services
- `ACCESS_NETWORK_STATE`: To check network connectivity
- `QUERY_ALL_PACKAGES`: To list and launch installed apps
- `READ_EXTERNAL_STORAGE`: For file access (if needed)
- `WRITE_EXTERNAL_STORAGE`: For file operations (if needed)

## Development

### Adding New Tools
1. Create a new class implementing the `Tool` interface
2. Register it in `ToolRegistry.registerDefaultTools()`
3. Implement the `execute()` method with your tool logic

Example:
```kotlin
class MyCustomTool : Tool {
    override val name = "my_tool"
    override val description = "Description of what this tool does"
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "param1" to mapOf(
                "type" to "string",
                "description" to "Parameter description"
            )
        ),
        "required" to listOf("param1")
    )
    
    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        // Your implementation here
        return ToolResult.Success("Result message")
    }
}
```

### Testing
```bash
# Run unit tests
./gradlew test

# Run instrumented tests (requires device/emulator)
./gradlew connectedAndroidTest
```

## Troubleshooting

### Common Issues

1. **Build fails with "SDK not found"**
   - Set ANDROID_HOME environment variable
   - Point to your Android SDK location

2. **Gradle sync fails**
   - Check internet connection
   - Clear Gradle cache: `./gradlew clean`
   - Delete `.gradle` folder and re-sync

3. **App crashes on launch**
   - Check logcat: `adb logcat | grep AIAAgent`
   - Verify API keys are configured
   - Check permissions are granted

4. **Tools not working**
   - Ensure required permissions are granted
   - Check device compatibility (min API 24)
   - Review logcat for specific errors

## Security Notes

- API keys are stored using Android's EncryptedSharedPreferences
- Never commit API keys to version control
- Use ProGuard/R8 for release builds to obfuscate code
- Validate all tool inputs to prevent injection attacks

## License

See LICENSE file for details.

## Support

For issues and questions:
- Check existing issues in the repository
- Review Android documentation: https://developer.android.com
- OpenAI API docs: https://platform.openai.com/docs
- Google AI docs: https://ai.google.dev/docs
