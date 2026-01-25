package com.example.aiaagent.tools

import android.content.Context
import android.content.Intent
import com.google.gson.Gson

class GetInstalledAppsTool : Tool {
    override val name = "get_installed_apps"
    override val description = "Get a list of all installed applications on the device"
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "limit" to mapOf(
                "type" to "number",
                "description" to "Maximum number of apps to return (default: 50)"
            )
        )
    )
    
    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        return try {
            val limit = (arguments["limit"] as? Number)?.toInt() ?: 50
            val pm = context.packageManager
            val intent = Intent(Intent.ACTION_MAIN, null).apply {
                addCategory(Intent.CATEGORY_LAUNCHER)
            }
            
            val apps = pm.queryIntentActivities(intent, 0)
                .map { resolveInfo ->
                    mapOf(
                        "name" to resolveInfo.loadLabel(pm).toString(),
                        "package" to resolveInfo.activityInfo.packageName
                    )
                }
                .sortedBy { it["name"] as String }
                .take(limit)
            
            val gson = Gson()
            val appsJson = gson.toJson(apps)
            
            ToolResult.Success(
                result = "Found ${apps.size} installed apps:\n${apps.joinToString("\n") { "- ${it["name"]}" }}",
                data = apps
            )
        } catch (e: Exception) {
            ToolResult.Error("Failed to get installed apps: ${e.message}")
        }
    }
}
