package com.example.aiaagent.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.aiaagent.data.model.Message
import com.example.aiaagent.data.repository.ChatRepository
import com.example.aiaagent.service.AIAgentService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

class ChatViewModel(
    private val chatRepository: ChatRepository = ChatRepository(),
    private val aiAgentService: AIAgentService? = null
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            chatRepository.messages.collect { messages ->
                _uiState.value = _uiState.value.copy(messages = messages)
            }
        }
    }

    suspend fun sendMessage(content: String) {
        if (content.isBlank()) return

        val userMessage = Message(
            id = UUID.randomUUID().toString(),
            content = content,
            isFromUser = true
        )

        chatRepository.addMessage(userMessage)
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)

        try {
            val response = aiAgentService?.processMessage(content)
                ?: "AI Agent service not initialized. Please configure your API keys in settings."

            val aiMessage = Message(
                id = UUID.randomUUID().toString(),
                content = response,
                isFromUser = false
            )

            chatRepository.addMessage(aiMessage)
        } catch (e: Exception) {
            _uiState.value = _uiState.value.copy(
                error = "Error: ${e.message}"
            )
        } finally {
            _uiState.value = _uiState.value.copy(isLoading = false)
        }
    }
}

data class ChatUiState(
    val messages: List<Message> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)
