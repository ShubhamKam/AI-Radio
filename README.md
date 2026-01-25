# Android AI Agent

An intelligent Android application that combines cloud AI models (OpenAI GPT-4, Google Gemini) with local device capabilities through a conversational chat interface. The AI agent can interact with Android apps and system tools to help users accomplish tasks naturally.

## 🌟 Features

### AI Integration
- **Multiple AI Providers**: OpenAI GPT-4, Google Gemini Pro, and local models
- **Function Calling**: AI can intelligently use tools based on user requests
- **Conversation Context**: Maintains chat history for coherent multi-turn conversations
- **Provider Switching**: Easily switch between different AI providers

### Device Tools
- **App Management**: Launch any installed app by name
- **System Monitoring**: Check battery status, network info, storage usage
- **Device Information**: Get detailed system and hardware information
- **Calculator**: Perform mathematical calculations
- **Extensible**: Easy to add custom tools

### User Interface
- **Modern Design**: Material Design 3 with Jetpack Compose
- **Chat Interface**: Intuitive messaging UI with message bubbles
- **Real-time Updates**: Live tool execution indicators
- **Settings Screen**: Configure API keys and preferences
- **Error Handling**: Clear error messages and recovery options

## 🚀 Quick Start

### Prerequisites
- Android Studio Arctic Fox or later
- JDK 17 or higher
- Android SDK API 34
- Minimum device: Android 7.0 (API 24)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AIAAgent
   ```

2. **Open in Android Studio**
   - File → Open → Select project directory
   - Wait for Gradle sync to complete

3. **Build and Run**
   ```bash
   ./gradlew assembleDebug
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

4. **Configure API Keys**
   - Launch the app
   - Tap the settings icon (⚙️)
   - Enter your OpenAI or Google AI API key
   - Select your preferred AI provider

### Getting API Keys

**OpenAI:**
1. Visit https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy and paste into the app

**Google AI:**
1. Visit https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create an API key
4. Copy and paste into the app

## 💬 Usage Examples

### Launch Apps
```
User: "Open Chrome"
AI: *Launches Chrome browser*

User: "Launch Gmail"
AI: *Opens Gmail app*
```

### System Information
```
User: "What's my battery level?"
AI: "Battery Status:
- Level: 85%
- Charging: Yes
- Charging Source: AC Adapter
- Health: Good"

User: "Check my storage"
AI: "Storage Information:
Internal Storage:
- Total: 128 GB
- Used: 45 GB
- Available: 83 GB
- Usage: 35%"
```

### Calculations
```
User: "Calculate 25 * 4 + 10"
AI: "25 * 4 + 10 = 110"
```

### App Discovery
```
User: "What apps do I have installed?"
AI: "Found 50 installed apps:
- Chrome
- Gmail
- Maps
- YouTube
..."
```

## 🏗️ Architecture

### Tech Stack
- **Language**: Kotlin 1.9.10
- **UI**: Jetpack Compose + Material3
- **Architecture**: MVVM (Model-View-ViewModel)
- **Networking**: Retrofit 2.9.0 + OkHttp 4.12.0
- **AI/ML**: TensorFlow Lite 2.14.0
- **Security**: Encrypted SharedPreferences
- **Async**: Kotlin Coroutines + Flow
- **Navigation**: Jetpack Navigation Compose

### Project Structure
```
app/src/main/java/com/example/aiaagent/
├── data/
│   ├── api/              # Retrofit API services
│   │   ├── OpenAIService.kt
│   │   ├── GoogleAIService.kt
│   │   └── AIServiceFactory.kt
│   ├── model/            # Data classes
│   │   ├── Message.kt
│   │   └── AIResponse.kt
│   ├── repository/       # Data layer
│   │   ├── ChatRepository.kt
│   │   ├── SettingsRepository.kt
│   │   └── AppToolsRepository.kt
│   └── service/          # Business logic
│       ├── AIService.kt
│       └── AIServiceImpl.kt
├── tools/                # Tool system
│   ├── Tool.kt           # Tool interface
│   ├── ToolRegistry.kt   # Tool management
│   ├── LaunchAppTool.kt
│   ├── GetBatteryStatusTool.kt
│   ├── GetNetworkInfoTool.kt
│   ├── GetStorageInfoTool.kt
│   ├── GetSystemInfoTool.kt
│   ├── CalculatorTool.kt
│   └── GetInstalledAppsTool.kt
├── ui/                   # Compose UI
│   ├── ChatScreen.kt
│   ├── SettingsScreen.kt
│   ├── Navigation.kt
│   └── theme/
│       ├── Color.kt
│       ├── Theme.kt
│       └── Type.kt
├── viewmodel/           # ViewModels
│   ├── ChatViewModel.kt
│   └── SettingsViewModel.kt
├── AIAgentApplication.kt
└── MainActivity.kt
```

## 🔧 Adding Custom Tools

Create a new tool by implementing the `Tool` interface:

```kotlin
class MyCustomTool : Tool {
    override val name = "my_custom_tool"
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
    
    override suspend fun execute(
        context: Context, 
        arguments: Map<String, Any>
    ): ToolResult {
        val param1 = arguments["param1"] as? String
        
        return try {
            // Your tool logic here
            ToolResult.Success("Operation completed successfully")
        } catch (e: Exception) {
            ToolResult.Error("Error: ${e.message}")
        }
    }
}
```

Register your tool in `ToolRegistry.kt`:
```kotlin
private fun registerDefaultTools() {
    register(LaunchAppTool())
    register(GetBatteryStatusTool())
    // ... other tools
    register(MyCustomTool())  // Add your tool here
}
```

## 🔒 Security

- **API Key Storage**: Uses Android's EncryptedSharedPreferences with AES256-GCM encryption
- **Network Security**: HTTPS for all API communications
- **Permissions**: Minimal required permissions with runtime checks
- **ProGuard**: Code obfuscation rules included for release builds

## 📱 Permissions

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## 🧪 Testing

```bash
# Run unit tests
./gradlew test

# Run instrumented tests
./gradlew connectedAndroidTest

# Generate test coverage report
./gradlew jacocoTestReport
```

## 📦 Building for Release

1. **Create keystore**
   ```bash
   keytool -genkey -v -keystore release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-alias
   ```

2. **Configure signing in `app/build.gradle.kts`**
   ```kotlin
   signingConfigs {
       create("release") {
           storeFile = file("release-key.jks")
           storePassword = "your-password"
           keyAlias = "my-alias"
           keyPassword = "your-password"
       }
   }
   ```

3. **Build release APK**
   ```bash
   ./gradlew assembleRelease
   ```

## 🐛 Troubleshooting

### App crashes on startup
- Check logcat: `adb logcat | grep AIAAgent`
- Verify API keys are configured
- Ensure permissions are granted

### Tools not working
- Grant required permissions in device settings
- Check device API level (minimum 24)
- Review tool-specific error messages

### Build errors
- Clean project: `./gradlew clean`
- Invalidate caches in Android Studio
- Update Gradle and dependencies

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Google for Gemini AI
- Android team for Jetpack Compose
- TensorFlow team for TFLite

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check [BUILD_INSTRUCTIONS.md](BUILD_INSTRUCTIONS.md) for detailed setup
- Review Android documentation: https://developer.android.com

---

**Note**: This app requires API keys from OpenAI or Google AI to function. Local model support is included but limited. Always keep your API keys secure and never commit them to version control.
