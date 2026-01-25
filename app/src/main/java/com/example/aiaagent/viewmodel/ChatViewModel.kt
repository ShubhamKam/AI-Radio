package com.example.aiaagent.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.aiaagent.data.model.AIProvider
import com.example.aiaagent.data.model.Message
import com.example.aiaagent.data.repository.ChatRepository
import com.example.aiaagent.data.repository.SettingsRepository
import com.example.aiaagent.data.service.AIService
import com.example.aiaagent.data.service.AIServiceImpl
import com.example.aiaagent.data.service.AIServiceResult
import com.example.aiaagent.data.service.ConversationMessage
import com.example.aiaagent.data.service.ToolCallRequest
import com.example.aiaagent.tools.ToolRegistry
import com.example.aiaagent.tools.ToolResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.UUID

class ChatViewModel(application: Application) : AndroidViewModel(application) {
    
    private val chatRepository = ChatRepository()
    private val settingsRepository = SettingsRepository(application)
    private val aiService: AIService = AIServiceImpl(application)
    private val toolRegistry = ToolRegistry(application)
    
    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()
    
    private val conversationHistory = mutableListOf<ConversationMessage>()
    
    init {
        viewModelScope.launch {
            chatRepository.messages.collect { messages ->
                _uiState.value = _uiState.value.copy(messages = messages)
            }
        }
        
        viewModelScope.launch {
            settingsRepository.settings.collect { settings ->
                _uiState.value = _uiState.value.copy(
                    currentProvider = settings.selectedProvider,
                    hasApiKey = when (settings.selectedProvider) {
                        AIProvider.OPENAI -> settings.openAIApiKey.isNotBlank()
                        AIProvider.GOOGLE_AI -> settings.googleAIApiKey.isNotBlank()
                        AIProvider.LOCAL_MODEL -> true
                    }
                )
            }
        }
    }
    
    fun sendMessage(content: String) {
        if (content.isBlank()) return
        
        viewModelScope.launch {
            // Add user message
            val userMessage = Message(
                id = UUID.randomUUID().toString(),
                content = content,
                isFromUser = true
            )
            chatRepository.addMessage(userMessage)
            
            // Add to conversation history
            conversationHistory.add(ConversationMessage(
                role = "user",
                content = content
            ))
            
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            // Get AI response
            processAIResponse(content)
        }
    }
    
    private suspend fun processAIResponse(userPrompt: String) {
        val settings = settingsRepository.settings.value
        val apiKey = when (settings.selectedProvider) {
            AIProvider.OPENAI -> settings.openAIApiKey
            AIProvider.GOOGLE_AI -> settings.googleAIApiKey
            AIProvider.LOCAL_MODEL -> ""
        }
        
        if (apiKey.isBlank() && settings.selectedProvider != AIProvider.LOCAL_MODEL) {
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                error = "Please configure your API key in settings"
            )
            return
        }
        
        val availableTools = toolRegistry.getAllTools()
        
        val result = aiService.generateResponse(
            prompt = userPrompt,
            conversationHistory = conversationHistory,
            availableTools = availableTools,
            provider = settings.selectedProvider,
            apiKey = apiKey
        )
        
        when (result) {
            is AIServiceResult.Success -> {
                // Check if there are tool calls
                if (result.toolCalls != null && result.toolCalls.isNotEmpty()) {
                    handleToolCalls(result.toolCalls, result.response)
                } else {
                    // Add assistant response
                    val assistantMessage = Message(
                        id = UUID.randomUUID().toString(),
                        content = result.response,
                        isFromUser = false
                    )
                    chatRepository.addMessage(assistantMessage)
                    
                    conversationHistory.add(ConversationMessage(
                        role = "assistant",
                        content = result.response
                    ))
                    
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
            }
            is AIServiceResult.Error -> {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = result.message
                )
                
                val errorMessage = Message(
                    id = UUID.randomUUID().toString(),
                    content = "Error: ${result.message}",
                    isFromUser = false
                )
                chatRepository.addMessage(errorMessage)
            }
        }
    }
    
    private suspend fun handleToolCalls(toolCalls: List<ToolCallRequest>, assistantMessage: String) {
        // Show tool execution indicator
        val toolMessage = Message(
            id = UUID.randomUUID().toString(),
            content = "🔧 Executing tools: ${toolCalls.joinToString(", ") { it.name }}",
            isFromUser = false
        )
        chatRepository.addMessage(toolMessage)
        
        // Execute each tool
        val toolResults = mutableListOf<Pair<ToolCallRequest, ToolResult>>()
        
        for (toolCall in toolCalls) {
            val result = toolRegistry.executeTool(toolCall.name, toolCall.arguments)
            toolResults.add(toolCall to result)
            
            // Add tool result message
            val resultContent = when (result) {
                is ToolResult.Success -> result.result
                is ToolResult.Error -> "Error: ${result.message}"
            }
            
            val resultMessage = Message(
                id = UUID.randomUUID().toString(),
                content = "📋 ${toolCall.name}: $resultContent",
                isFromUser = false
            )
            chatRepository.addMessage(resultMessage)
            
            // Add to conversation history
            conversationHistory.add(ConversationMessage(
                role = "tool",
                content = resultContent,
                toolCallId = toolCall.id,
                toolName = toolCall.name
            ))
        }
        
        // Add assistant message with tool calls to history
        conversationHistory.add(ConversationMessage(
            role = "assistant",
            content = assistantMessage,
            toolCalls = toolCalls
        ))
        
        // Get final response from AI with tool results
        val settings = settingsRepository.settings.value
        val apiKey = when (settings.selectedProvider) {
            AIProvider.OPENAI -> settings.openAIApiKey
            AIProvider.GOOGLE_AI -> settings.googleAIApiKey
            AIProvider.LOCAL_MODEL -> ""
        }
        
        val finalResult = aiService.generateResponse(
            prompt = "Based on the tool results above, provide a helpful response to the user.",
            conversationHistory = conversationHistory,
            availableTools = emptyList(), // Don't allow more tool calls in final response
            provider = settings.selectedProvider,
            apiKey = apiKey
        )
        
        when (finalResult) {
            is AIServiceResult.Success -> {
                val finalMessage = Message(
                    id = UUID.randomUUID().toString(),
                    content = finalResult.response,
                    isFromUser = false
                )
                chatRepository.addMessage(finalMessage)
                
                conversationHistory.add(ConversationMessage(
                    role = "assistant",
                    content = finalResult.response
                ))
            }
            is AIServiceResult.Error -> {
                val errorMessage = Message(
                    id = UUID.randomUUID().toString(),
                    content = "Error generating final response: ${finalResult.message}",
                    isFromUser = false
                )
                chatRepository.addMessage(errorMessage)
            }
        }
        
        _uiState.value = _uiState.value.copy(isLoading = false)
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
    
    fun clearChat() {
        conversationHistory.clear()
        // Note: ChatRepository would need a clear method
        _uiState.value = _uiState.value.copy(messages = emptyList())
    }
}

data class ChatUiState(
    val messages: List<Message> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val currentProvider: AIProvider = AIProvider.OPENAI,
    val hasApiKey: Boolean = false
)
