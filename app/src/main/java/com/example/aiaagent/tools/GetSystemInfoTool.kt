package com.example.aiaagent.tools

import android.content.Context
import android.os.Build

class GetSystemInfoTool : Tool {
    override val name = "get_system_info"
    override val description = "Get information about the Android device and system"
    override val parameters = mapOf(
        "type" to "object",
        "properties" to emptyMap<String, Any>()
    )
    
    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        return try {
            val result = buildString {
                append("System Information:\n\n")
                append("Device:\n")
                append("- Manufacturer: ${Build.MANUFACTURER}\n")
                append("- Model: ${Build.MODEL}\n")
                append("- Brand: ${Build.BRAND}\n")
                append("- Device: ${Build.DEVICE}\n\n")
                
                append("Android:\n")
                append("- Version: ${Build.VERSION.RELEASE}\n")
                append("- SDK: ${Build.VERSION.SDK_INT}\n")
                append("- Build ID: ${Build.ID}\n\n")
                
                append("Hardware:\n")
                append("- Board: ${Build.BOARD}\n")
                append("- Hardware: ${Build.HARDWARE}\n")
                append("- Supported ABIs: ${Build.SUPPORTED_ABIS.joinToString(", ")}")
            }
            
            ToolResult.Success(
                result = result,
                data = mapOf(
                    "manufacturer" to Build.MANUFACTURER,
                    "model" to Build.MODEL,
                    "androidVersion" to Build.VERSION.RELEASE,
                    "sdkInt" to Build.VERSION.SDK_INT
                )
            )
        } catch (e: Exception) {
            ToolResult.Error("Failed to get system info: ${e.message}")
        }
    }
}
