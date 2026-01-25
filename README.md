# Android AI Agent

An intelligent Android AI agent application that integrates multiple cloud AI providers (OpenAI, Google AI) and local AI models with Android device capabilities through a chat-based interface. The agent can understand natural language commands and execute actions like launching apps on your Android device.

## Features

### AI Integration
- **Multiple AI Providers**: Support for OpenAI GPT, Google Gemini, and local TensorFlow Lite models
- **Provider Selection**: Switch between AI providers in settings
- **Secure API Key Storage**: API keys are encrypted using Android's EncryptedSharedPreferences

### Tool/Function Calling
The AI agent can execute real-world actions on your Android device:
- **Launch Apps**: Open any installed application by name (e.g., "Open Chrome", "Launch Camera")
- **Search Apps**: Find installed applications by name or package
- **List Apps**: View all installed applications on the device

### Chat Interface
- Clean, modern Material Design 3 UI
- Real-time message updates
- Message history with visual distinction between user and AI messages
- Loading indicators during AI processing
- Error handling with user-friendly messages

### Architecture
- **MVVM Pattern**: Clean separation of concerns with ViewModels
- **Repository Pattern**: Data access abstraction
- **Coroutines**: Asynchronous operations for smooth UI
- **Compose Navigation**: Modern navigation between screens
- **Retrofit**: Network communication with AI APIs

## Project Structure

```
app/src/main/java/com/example/aiaagent/
├── data/
│   ├── api/
│   │   ├── OpenAIService.kt         # OpenAI API interface and models
│   │   └── GoogleAIService.kt       # Google AI API interface and models
│   ├── model/
│   │   ├── AIProvider.kt            # AI provider enum
│   │   ├── AIResponse.kt            # Response data models
│   │   └── Message.kt               # Chat message model
│   └── repository/
│       ├── AppToolsRepository.kt    # App launching and management
│       ├── ChatRepository.kt        # Chat message management
│       └── SettingsRepository.kt    # Settings and API key storage
├── service/
│   ├── AIAgentService.kt           # Main agent orchestration
│   ├── AIProviderService.kt        # AI provider abstraction
│   ├── LocalModelService.kt        # TensorFlow Lite integration
│   └── ToolExecutor.kt             # Tool/function execution
├── ui/
│   ├── ChatScreen.kt               # Main chat interface
│   ├── SettingsScreen.kt           # Settings configuration
│   ├── Navigation.kt               # Navigation setup
│   └── theme/                      # Material Design 3 theme
├── viewmodel/
│   ├── ChatViewModel.kt            # Chat screen logic
│   └── SettingsViewModel.kt        # Settings screen logic
└── MainActivity.kt                 # App entry point
```

## Setup Instructions

### Prerequisites
- Android Studio (latest version recommended)
- Android SDK 24+ (Android 7.0 Nougat or higher)
- API keys from one or more providers:
  - OpenAI API key from https://platform.openai.com/api-keys
  - Google AI API key from https://makersuite.google.com/app/apikey

### Building the App

1. Clone the repository
2. Open the project in Android Studio
3. Sync Gradle dependencies
4. Build and run on an Android device or emulator

```bash
./gradlew assembleDebug
```

### Configuration

1. Launch the app
2. Navigate to Settings (gear icon in top right)
3. Enter your API key(s):
   - **OpenAI**: Enter your key starting with `sk-...`
   - **Google AI**: Enter your key starting with `AIza...`
4. Select your preferred AI provider
5. Tap "Save Settings"

## Usage Examples

Once configured, you can chat with the AI agent naturally:

### Launching Apps
```
User: "Open Chrome"
AI: "Launching Chrome..." [Chrome app opens]

User: "Launch the camera app"
AI: "Launching Camera..." [Camera app opens]
```

### Searching Apps
```
User: "What messaging apps do I have?"
AI: "Found 3 apps:
- WhatsApp
- Messages
- Telegram"
```

### General Conversation
```
User: "What's the weather like?"
AI: "I can help you check the weather. Would you like me to open a weather app?"
```

## Technical Details

### AI Provider Integration

#### OpenAI GPT
- Uses GPT-4 model
- Supports function calling for tool execution
- Maintains conversation history
- Error handling for rate limits and API issues

#### Google AI (Gemini)
- Uses Gemini Pro model
- Text generation via Google's Generative Language API
- Simple prompt/response interface

#### Local Models
- TensorFlow Lite integration
- Placeholder for on-device inference
- Suitable for privacy-focused deployments

### Tool Execution System

The agent uses OpenAI's function calling feature to execute tools:

1. **Tool Definition**: Tools are defined with JSON schemas
2. **AI Decision**: The AI decides when to use a tool based on user input
3. **Execution**: The ToolExecutor parses arguments and executes the action
4. **Response**: Results are fed back to the AI to generate a natural language response

### Security

- **Encrypted Storage**: API keys stored using EncryptedSharedPreferences with AES256_GCM
- **No Cloud Backup**: API keys excluded from cloud backup
- **Permissions**: Minimal permissions requested (Internet, Network State, Query Packages)

## Permissions

- `INTERNET`: Required for API calls to cloud AI providers
- `ACCESS_NETWORK_STATE`: Check network connectivity
- `QUERY_ALL_PACKAGES`: List and launch installed apps (Android 11+)

## Dependencies

Key dependencies include:
- Jetpack Compose (UI framework)
- Retrofit (HTTP client)
- OkHttp (Network layer)
- TensorFlow Lite (Local AI models)
- Room (Database, for future use)
- Navigation Compose (Screen navigation)
- Security Crypto (Encrypted storage)

## Future Enhancements

Potential features for future development:
- Additional tools (send SMS, make calls, set reminders)
- Voice input/output
- Fully functional local AI models
- Multi-modal inputs (images, documents)
- Task automation and scheduling
- Integration with more Android APIs
- Conversation export/import
- Custom tool creation

## Contributing

This is an open-source project. Contributions are welcome!

## License

See LICENSE file for details.

## Troubleshooting

### App crashes on launch
- Check that all dependencies are properly synced
- Ensure target SDK is properly configured
- Verify AndroidManifest.xml permissions

### AI not responding
- Verify API keys are correctly entered in Settings
- Check internet connection
- Ensure selected AI provider is configured
- Check API quota/billing status

### Apps not launching
- Verify `QUERY_ALL_PACKAGES` permission is granted
- Check that the app name matches installed apps
- Some system apps may not be launchable

### Build errors
- Clean and rebuild the project: `./gradlew clean build`
- Invalidate caches in Android Studio
- Update Gradle and dependencies to latest versions

## Credits

Built using:
- Kotlin
- Jetpack Compose
- OpenAI API
- Google AI API
- TensorFlow Lite
- Material Design 3

---

For questions or issues, please open a GitHub issue.