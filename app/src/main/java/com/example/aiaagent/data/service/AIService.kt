package com.example.aiaagent.data.service

import com.example.aiaagent.data.model.AIProvider
import com.example.aiaagent.data.model.AIResponse
import com.example.aiaagent.tools.Tool
import com.example.aiaagent.tools.ToolResult

interface AIService {
    suspend fun generateResponse(
        prompt: String,
        conversationHistory: List<ConversationMessage>,
        availableTools: List<Tool>,
        provider: AIProvider,
        apiKey: String
    ): AIServiceResult
}

data class ConversationMessage(
    val role: String, // "user", "assistant", "system", "tool"
    val content: String,
    val toolCalls: List<ToolCallRequest>? = null,
    val toolCallId: String? = null,
    val toolName: String? = null
)

data class ToolCallRequest(
    val id: String,
    val name: String,
    val arguments: Map<String, Any>
)

sealed class AIServiceResult {
    data class Success(
        val response: String,
        val toolCalls: List<ToolCallRequest>? = null
    ) : AIServiceResult()
    
    data class Error(val message: String, val exception: Exception? = null) : AIServiceResult()
}
