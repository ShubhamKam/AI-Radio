package com.example.aiaagent.service

import android.content.Context
import com.example.aiaagent.data.api.OpenAIMessage
import com.example.aiaagent.data.model.AIProvider
import com.example.aiaagent.data.repository.AppToolsRepository
import com.example.aiaagent.data.repository.SettingsRepository
import kotlinx.coroutines.flow.first

class AIAgentService(
    private val context: Context,
    private val settingsRepository: SettingsRepository
) {

    private val appToolsRepository = AppToolsRepository(context)
    private val toolExecutor = ToolExecutor(context, appToolsRepository)
    private val conversationHistory = mutableListOf<OpenAIMessage>()

    init {
        // Add system message to explain the agent's capabilities
        conversationHistory.add(
            OpenAIMessage(
                role = "system",
                content = """You are an AI agent running on an Android device with the ability to control apps and provide assistance.
                    |You have access to the following capabilities:
                    |1. launch_app: Launch any installed application by name
                    |2. search_apps: Search for apps on the device
                    |3. list_apps: List all installed applications
                    |
                    |When the user asks you to open an app or perform a task that requires an app, use the appropriate tool.
                    |Be helpful, concise, and confirm actions you take.
                """.trimMargin()
            )
        )
    }

    suspend fun processMessage(userMessage: String): String {
        val settings = settingsRepository.settings.first()
        val provider = settings.selectedProvider
        val apiKey = when (provider) {
            AIProvider.OPENAI -> settings.openAIApiKey
            AIProvider.GOOGLE_AI -> settings.googleAIApiKey
            AIProvider.LOCAL_MODEL -> ""
        }

        if (apiKey.isEmpty() && provider != AIProvider.LOCAL_MODEL) {
            return "Please configure your API key in settings for ${provider.name}"
        }

        val aiProvider = AIProviderService(provider, apiKey)
        val tools = if (provider == AIProvider.OPENAI) {
            ToolExecutor.getAvailableTools()
        } else null

        // Add user message to history
        conversationHistory.add(
            OpenAIMessage(
                role = "user",
                content = userMessage
            )
        )

        var response = aiProvider.sendMessage(
            message = userMessage,
            conversationHistory = conversationHistory.dropLast(1), // Don't include the message we just added
            tools = tools
        )

        // Handle tool calls
        if (response.toolCalls != null && response.toolCalls.isNotEmpty()) {
            // Add assistant message with tool calls to history
            conversationHistory.add(
                OpenAIMessage(
                    role = "assistant",
                    content = "",
                    tool_calls = response.toolCalls.map { tc ->
                        com.example.aiaagent.data.api.OpenAIToolCall(
                            id = tc.id,
                            type = "function",
                            function = com.example.aiaagent.data.api.OpenAIFunctionCall(
                                name = tc.name,
                                arguments = tc.arguments
                            )
                        )
                    }
                )
            )

            // Execute tools
            val toolResults = mutableListOf<String>()
            for (toolCall in response.toolCalls) {
                val result = toolExecutor.executeTool(toolCall)
                toolResults.add(result.result)

                // Add tool result to history
                conversationHistory.add(
                    OpenAIMessage(
                        role = "tool",
                        content = result.result,
                        tool_call_id = toolCall.id,
                        name = toolCall.name
                    )
                )
            }

            // Get final response after tool execution
            response = aiProvider.sendMessage(
                message = "",
                conversationHistory = conversationHistory.dropLast(1),
                tools = tools
            )
        }

        // Add assistant response to history
        conversationHistory.add(
            OpenAIMessage(
                role = "assistant",
                content = response.content
            )
        )

        // Keep conversation history manageable (last 20 messages)
        if (conversationHistory.size > 21) { // 1 system + 20 messages
            conversationHistory.removeAt(1) // Remove oldest message after system
        }

        return response.content
    }

    fun clearHistory() {
        conversationHistory.clear()
        conversationHistory.add(
            OpenAIMessage(
                role = "system",
                content = """You are an AI agent running on an Android device with the ability to control apps and provide assistance.
                    |You have access to the following capabilities:
                    |1. launch_app: Launch any installed application by name
                    |2. search_apps: Search for apps on the device
                    |3. list_apps: List all installed applications
                    |
                    |When the user asks you to open an app or perform a task that requires an app, use the appropriate tool.
                    |Be helpful, concise, and confirm actions you take.
                """.trimMargin()
            )
        )
    }
}
