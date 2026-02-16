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

    companion object {
        private val TERMUX_SYSTEM_PROMPT = """
            |You are Termux AI Agent — an intelligent assistant running on an Android device with full access 
            |to the Termux terminal environment. You can execute Linux shell commands, manage packages, 
            |browse files, run scripts, perform network operations, and access Android device features 
            |through Termux:API.
            |
            |CAPABILITIES:
            |1. Shell Commands (termux_execute): Run any Linux command — ls, cat, grep, awk, sed, git, etc.
            |2. Package Manager (termux_package): Install/remove/search packages via pkg/apt.
            |3. File Manager (termux_file): Browse, read, write, delete, copy, move files.
            |4. Script Runner (termux_script): Execute Python, Bash, Node.js, Ruby, Perl scripts.
            |5. Network Tools (termux_network): curl, wget, ping, ifconfig, nmap, traceroute, nslookup.
            |6. System APIs (termux_system): Battery, WiFi, GPS, camera, clipboard, toast, vibrate, TTS, 
            |   notifications, SMS, contacts, call log, sensors, torch, brightness, volume, fingerprint.
            |7. Process Manager (termux_process): List/kill processes, monitor resource usage.
            |8. Storage (termux_storage): Access shared storage, Downloads, DCIM, Pictures, Music.
            |9. Device Tools: Launch apps, get battery/network/storage/system info, calculator.
            |
            |BEHAVIOR GUIDELINES:
            |- When the user asks to run a command, use the termux_execute tool.
            |- When the user asks about files, use termux_file tool.
            |- When the user asks to install something, use termux_package tool.
            |- When the user asks to run a script or code, use termux_script tool.
            |- When the user asks about network/connectivity, use termux_network tool.
            |- When the user asks about device features (battery, location, etc.), use termux_system tool.
            |- Format terminal output clearly. Use code blocks for command output.
            |- If a command fails, explain the error and suggest fixes.
            |- Be proactive: if a package is needed but not installed, offer to install it.
            |- Always prioritize safety: warn before destructive operations (rm -rf, etc.).
            |- For complex tasks, break them into steps and execute sequentially.
        """.trimMargin()
    }

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

            messages.add(
                OpenAIMessage(
                    role = "system",
                    content = TERMUX_SYSTEM_PROMPT
                )
            )

            conversationHistory.forEach { msg ->
                when (msg.role) {
                    "tool" -> {
                        messages.add(
                            OpenAIMessage(
                                role = "tool",
                                content = msg.content,
                                tool_call_id = msg.toolCallId,
                                name = msg.toolName
                            )
                        )
                    }
                    else -> {
                        messages.add(
                            OpenAIMessage(
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
                            )
                        )
                    }
                }
            }

            messages.add(OpenAIMessage(role = "user", content = prompt))

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

                    if (message.tool_calls != null && message.tool_calls.isNotEmpty()) {
                        val toolCalls = message.tool_calls.map { tc ->
                            ToolCallRequest(
                                id = tc.id,
                                name = tc.function.name,
                                arguments = gson.fromJson(
                                    tc.function.arguments,
                                    Map::class.java
                                ) as Map<String, Any>
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
            val fullPrompt = buildString {
                append(TERMUX_SYSTEM_PROMPT)
                append("\n\n")

                if (availableTools.isNotEmpty()) {
                    append("Available tools:\n")
                    availableTools.forEach { tool ->
                        append("- ${tool.name}: ${tool.description}\n")
                        append("  Parameters: ${gson.toJson(tool.parameters)}\n")
                    }
                    append("\n")
                    append("To use a tool, respond with: TOOL_CALL: tool_name(param1=value1, param2=value2)\n\n")
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
        return AIServiceResult.Success(
            response = "Local model response: I received your message '$prompt'. " +
                    "Local AI models are not fully implemented yet. Please use OpenAI or Google AI for full Termux integration functionality."
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
