package com.example.aiaagent.service

import android.content.Context
import com.example.aiaagent.data.repository.AppToolsRepository
import com.google.gson.Gson
import com.google.gson.JsonObject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ToolExecutor(
    private val context: Context,
    private val appToolsRepository: AppToolsRepository
) {

    private val gson = Gson()

    suspend fun executeTool(toolCall: ToolCall): ToolExecutionResult {
        return withContext(Dispatchers.IO) {
            try {
                when (toolCall.name) {
                    "launch_app" -> launchApp(toolCall.arguments)
                    "search_apps" -> searchApps(toolCall.arguments)
                    "list_apps" -> listApps()
                    else -> ToolExecutionResult(
                        success = false,
                        result = "Unknown tool: ${toolCall.name}"
                    )
                }
            } catch (e: Exception) {
                ToolExecutionResult(
                    success = false,
                    result = "Error executing tool: ${e.message}"
                )
            }
        }
    }

    private suspend fun launchApp(arguments: String): ToolExecutionResult {
        val args = gson.fromJson(arguments, JsonObject::class.java)
        val appName = args.get("app_name")?.asString ?: return ToolExecutionResult(
            success = false,
            result = "Missing app_name parameter"
        )

        val appInfo = appToolsRepository.findAppByName(appName)
        if (appInfo == null) {
            return ToolExecutionResult(
                success = false,
                result = "App not found: $appName"
            )
        }

        val launched = appToolsRepository.launchApp(appInfo.packageName)
        return ToolExecutionResult(
            success = launched,
            result = if (launched) "Launched ${appInfo.appName}" else "Failed to launch ${appInfo.appName}"
        )
    }

    private suspend fun searchApps(arguments: String): ToolExecutionResult {
        val args = gson.fromJson(arguments, JsonObject::class.java)
        val query = args.get("query")?.asString ?: return ToolExecutionResult(
            success = false,
            result = "Missing query parameter"
        )

        val apps = appToolsRepository.getInstalledApps()
        val filtered = apps.filter {
            it.appName.contains(query, ignoreCase = true) ||
            it.packageName.contains(query, ignoreCase = true)
        }.take(10)

        val result = if (filtered.isEmpty()) {
            "No apps found matching: $query"
        } else {
            "Found ${filtered.size} apps:\n" + filtered.joinToString("\n") { "- ${it.appName}" }
        }

        return ToolExecutionResult(
            success = true,
            result = result
        )
    }

    private suspend fun listApps(): ToolExecutionResult {
        val apps = appToolsRepository.getInstalledApps().take(20)
        val result = "Installed apps (showing first 20):\n" +
            apps.joinToString("\n") { "- ${it.appName}" }

        return ToolExecutionResult(
            success = true,
            result = result
        )
    }

    companion object {
        fun getAvailableTools(): List<com.example.aiaagent.data.api.OpenAITool> {
            return listOf(
                com.example.aiaagent.data.api.OpenAITool(
                    type = "function",
                    function = com.example.aiaagent.data.api.OpenAIFunction(
                        name = "launch_app",
                        description = "Launch an application on the Android device by name",
                        parameters = com.example.aiaagent.data.api.OpenAIFunctionParameters(
                            properties = mapOf(
                                "app_name" to com.example.aiaagent.data.api.OpenAIProperty(
                                    type = "string",
                                    description = "The name of the app to launch (e.g., 'Chrome', 'Gmail', 'Camera')"
                                )
                            ),
                            required = listOf("app_name")
                        )
                    )
                ),
                com.example.aiaagent.data.api.OpenAITool(
                    type = "function",
                    function = com.example.aiaagent.data.api.OpenAIFunction(
                        name = "search_apps",
                        description = "Search for installed applications by name or package",
                        parameters = com.example.aiaagent.data.api.OpenAIFunctionParameters(
                            properties = mapOf(
                                "query" to com.example.aiaagent.data.api.OpenAIProperty(
                                    type = "string",
                                    description = "Search query for app name or package"
                                )
                            ),
                            required = listOf("query")
                        )
                    )
                ),
                com.example.aiaagent.data.api.OpenAITool(
                    type = "function",
                    function = com.example.aiaagent.data.api.OpenAIFunction(
                        name = "list_apps",
                        description = "List all installed applications on the device",
                        parameters = com.example.aiaagent.data.api.OpenAIFunctionParameters(
                            properties = mapOf(),
                            required = emptyList()
                        )
                    )
                )
            )
        }
    }
}

data class ToolExecutionResult(
    val success: Boolean,
    val result: String
)
