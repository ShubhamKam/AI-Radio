package com.example.aiaagent.data.service

import android.content.Context
import com.example.aiaagent.data.api.AIServiceFactory
import com.example.aiaagent.data.api.GoogleAIContent
import com.example.aiaagent.data.api.GoogleAIPart
import com.example.aiaagent.data.api.GoogleAIRequest
import com.example.aiaagent.data.api.OpenAIFunction
import com.example.aiaagent.data.api.OpenAIMessage
import com.example.aiaagent.data.api.OpenAIRequest
import com.example.aiaagent.data.api.OpenAITool
import com.example.aiaagent.data.model.AIProvider
import com.example.aiaagent.tools.Tool
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AIServiceImpl(private val context: Context) : AIService {
    
    private val openAIService = AIServiceFactory.createOpenAIService()
    private val googleAIService = AIServiceFactory.createGoogleAIService()
    private val gson = Gson()
    
    override suspend fun generateResponse(
        prompt: String,
        conversationHistory: List<ConversationMessage>,
        availableTools: List<Tool>,
        provider: AIProvider,
        apiKey: String
    ): AIServiceResult = withContext(Dispatchers.IO) {
        try {
            when (provider) {
                AIProvider.OPENAI -> generateOpenAIResponse(prompt, conversationHistory, availableTools, apiKey)
                AIProvider.GOOGLE_AI -> generateGoogleAIResponse(prompt, conversationHistory, availableTools, apiKey)
                AIProvider.LOCAL_MODEL -> generateLocalModelResponse(prompt, conversationHistory)
            }
        } catch (e: Exception) {
            AIServiceResult.Error("Failed to generate response: ${e.message}", e)
        }
    }
    
    private suspend fun generateOpenAIResponse(
        prompt: String,
        conversationHistory: List<ConversationMessage>,
        availableTools: List<Tool>,
        apiKey: String
    ): AIServiceResult {
        try {
            val messages = mutableListOf<OpenAIMessage>()
            
            // Add system message
            messages.add(OpenAIMessage(
                role = "system",
                content = """You are a helpful AI assistant with access to various tools and Android apps. 
                    |When users ask you to perform actions, use the available tools.
                    |Be concise and helpful in your responses.""".trimMargin()
            ))
            
            // Add conversation history
            conversationHistory.forEach { msg ->
                when (msg.role) {
                    "tool" -> {
                        messages.add(OpenAIMessage(
                            role = "tool",
                            content = msg.content,
                            tool_call_id = msg.toolCallId,
                            name = msg.toolName
                        ))
                    }
                    else -> {
                        messages.add(OpenAIMessage(
                            role = msg.role,
                            content = msg.content,
                            tool_calls = msg.toolCalls?.map { tc ->
                                com.example.aiaagent.data.api.OpenAIToolCall(
                                    id = tc.id,
                                    type = "function",
                                    function = com.example.aiaagent.data.api.OpenAIFunctionCall(
                                        name = tc.name,
                                        arguments = gson.toJson(tc.arguments)
                                    )
                                )
                            }
                        ))
                    }
                }
            }
            
            // Add current prompt
            messages.add(OpenAIMessage(role = "user", content = prompt))
            
            // Convert tools to OpenAI format
            val tools = availableTools.map { tool ->
                OpenAITool(
                    type = "function",
                    function = OpenAIFunction(
                        name = tool.name,
                        description = tool.description,
                        parameters = tool.parameters
                    )
                )
            }
            
            val request = OpenAIRequest(
                model = "gpt-4",
                messages = messages,
                tools = if (tools.isNotEmpty()) tools else null,
                tool_choice = if (tools.isNotEmpty()) "auto" else null
            )
            
            val response = openAIService.createChatCompletion(
                authorization = "Bearer $apiKey",
                request = request
            )
            
            if (response.isSuccessful && response.body() != null) {
                val choice = response.body()!!.choices.firstOrNull()
                if (choice != null) {
                    val message = choice.message
                    
                    // Check if there are tool calls
                    if (message.tool_calls != null && message.tool_calls.isNotEmpty()) {
                        val toolCalls = message.tool_calls.map { tc ->
                            ToolCallRequest(
                                id = tc.id,
                                name = tc.function.name,
                                arguments = gson.fromJson(tc.function.arguments, Map::class.java) as Map<String, Any>
                            )
                        }
                        return AIServiceResult.Success(
                            response = message.content ?: "",
                            toolCalls = toolCalls
                        )
                    }
                    
                    return AIServiceResult.Success(response = message.content ?: "")
                }
            }
            
            return AIServiceResult.Error("Failed to get response from OpenAI: ${response.code()}")
        } catch (e: Exception) {
            return AIServiceResult.Error("OpenAI error: ${e.message}", e)
        }
    }
    
    private suspend fun generateGoogleAIResponse(
        prompt: String,
        conversationHistory: List<ConversationMessage>,
        availableTools: List<Tool>,
        apiKey: String
    ): AIServiceResult {
        try {
            // Build conversation context
            val fullPrompt = buildString {
                append("You are a helpful AI assistant with access to various tools and Android apps.\n\n")
                
                if (availableTools.isNotEmpty()) {
                    append("Available tools:\n")
                    availableTools.forEach { tool ->
                        append("- ${tool.name}: ${tool.description}\n")
                    }
                    append("\n")
                }
                
                conversationHistory.forEach { msg ->
                    append("${msg.role}: ${msg.content}\n")
                }
                
                append("user: $prompt")
            }
            
            val request = GoogleAIRequest(
                contents = listOf(
                    GoogleAIContent(
                        parts = listOf(GoogleAIPart(text = fullPrompt))
                    )
                )
            )
            
            val response = googleAIService.generateContent(
                apiKey = apiKey,
                request = request
            )
            
            if (response.isSuccessful && response.body() != null) {
                val candidate = response.body()!!.candidates.firstOrNull()
                if (candidate != null) {
                    val text = candidate.content.parts.firstOrNull()?.text ?: ""
                    
                    // Simple tool detection for Google AI (since it doesn't have native function calling in this version)
                    val toolCallPattern = Regex("""TOOL_CALL:\s*(\w+)\((.*?)\)""")
                    val match = toolCallPattern.find(text)
                    
                    if (match != null) {
                        val toolName = match.groupValues[1]
                        val argsString = match.groupValues[2]
                        val args = parseSimpleArgs(argsString)
                        
                        return AIServiceResult.Success(
                            response = text,
                            toolCalls = listOf(
                                ToolCallRequest(
                                    id = "google_${System.currentTimeMillis()}",
                                    name = toolName,
                                    arguments = args
                                )
                            )
                        )
                    }
                    
                    return AIServiceResult.Success(response = text)
                }
            }
            
            return AIServiceResult.Error("Failed to get response from Google AI: ${response.code()}")
        } catch (e: Exception) {
            return AIServiceResult.Error("Google AI error: ${e.message}", e)
        }
    }
    
    private suspend fun generateLocalModelResponse(
        prompt: String,
        conversationHistory: List<ConversationMessage>
    ): AIServiceResult {
        // Placeholder for local TensorFlow Lite model
        // In a real implementation, you would load and run a TFLite model here
        return AIServiceResult.Success(
            response = "Local model response: I received your message '$prompt'. " +
                    "Local AI models are not fully implemented yet. Please use OpenAI or Google AI for full functionality."
        )
    }
    
    private fun parseSimpleArgs(argsString: String): Map<String, Any> {
        val args = mutableMapOf<String, Any>()
        if (argsString.isBlank()) return args
        
        argsString.split(",").forEach { pair ->
            val parts = pair.trim().split("=")
            if (parts.size == 2) {
                args[parts[0].trim()] = parts[1].trim().removeSurrounding("\"")
            }
        }
        return args
    }
}
