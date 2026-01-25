package com.example.aiaagent.tools

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager

class LaunchAppTool : Tool {
    override val name = "launch_app"
    override val description = "Launch an Android application by name or package name"
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "app_name" to mapOf(
                "type" to "string",
                "description" to "The name of the app to launch (e.g., 'Chrome', 'Gmail')"
            ),
            "package_name" to mapOf(
                "type" to "string",
                "description" to "The package name of the app (optional, e.g., 'com.android.chrome')"
            )
        ),
        "required" to listOf("app_name")
    )
    
    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        val appName = arguments["app_name"] as? String
        val packageName = arguments["package_name"] as? String
        
        if (appName.isNullOrBlank() && packageName.isNullOrBlank()) {
            return ToolResult.Error("Either app_name or package_name must be provided")
        }
        
        return try {
            val pm = context.packageManager
            val targetPackage = packageName ?: findPackageByName(context, appName!!)
            
            if (targetPackage != null) {
                val intent = pm.getLaunchIntentForPackage(targetPackage)
                if (intent != null) {
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    context.startActivity(intent)
                    ToolResult.Success("Successfully launched $appName")
                } else {
                    ToolResult.Error("Could not find launch intent for $appName")
                }
            } else {
                ToolResult.Error("App '$appName' not found on device")
            }
        } catch (e: Exception) {
            ToolResult.Error("Failed to launch app: ${e.message}")
        }
    }
    
    private fun findPackageByName(context: Context, appName: String): String? {
        val pm = context.packageManager
        val intent = Intent(Intent.ACTION_MAIN, null).apply {
            addCategory(Intent.CATEGORY_LAUNCHER)
        }
        
        val apps = pm.queryIntentActivities(intent, 0)
        return apps.find { 
            it.loadLabel(pm).toString().contains(appName, ignoreCase = true) 
        }?.activityInfo?.packageName
    }
}
