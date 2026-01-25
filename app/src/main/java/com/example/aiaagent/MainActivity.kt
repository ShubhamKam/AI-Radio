package com.example.aiaagent

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.example.aiaagent.data.repository.ChatRepository
import com.example.aiaagent.data.repository.SettingsRepository
import com.example.aiaagent.service.AIAgentService
import com.example.aiaagent.ui.AppNavigation
import com.example.aiaagent.ui.theme.AIAAgentTheme
import com.example.aiaagent.viewmodel.ChatViewModel
import com.example.aiaagent.viewmodel.SettingsViewModel

class MainActivity : ComponentActivity() {

    private lateinit var settingsRepository: SettingsRepository
    private lateinit var chatRepository: ChatRepository
    private lateinit var aiAgentService: AIAgentService
    private lateinit var chatViewModel: ChatViewModel
    private lateinit var settingsViewModel: SettingsViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize repositories and services
        settingsRepository = SettingsRepository(applicationContext)
        chatRepository = ChatRepository()
        aiAgentService = AIAgentService(applicationContext, settingsRepository)

        // Initialize ViewModels
        chatViewModel = ChatViewModel(chatRepository, aiAgentService)
        settingsViewModel = SettingsViewModel(settingsRepository)

        setContent {
            AIAAgentTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavigation(
                        chatViewModel = chatViewModel,
                        settingsViewModel = settingsViewModel
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    AIAAgentTheme {
        // Preview with empty ViewModels
    }
}