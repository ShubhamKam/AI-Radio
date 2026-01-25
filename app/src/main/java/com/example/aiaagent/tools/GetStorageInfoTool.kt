package com.example.aiaagent.tools

import android.content.Context
import android.os.Environment
import android.os.StatFs
import java.text.DecimalFormat

class GetStorageInfoTool : Tool {
    override val name = "get_storage_info"
    override val description = "Get information about device storage (internal and external)"
    override val parameters = mapOf(
        "type" to "object",
        "properties" to emptyMap<String, Any>()
    )
    
    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        return try {
            val internalPath = Environment.getDataDirectory()
            val internalStat = StatFs(internalPath.path)
            
            val internalTotal = internalStat.blockCountLong * internalStat.blockSizeLong
            val internalAvailable = internalStat.availableBlocksLong * internalStat.blockSizeLong
            val internalUsed = internalTotal - internalAvailable
            
            val result = buildString {
                append("Storage Information:\n\n")
                append("Internal Storage:\n")
                append("- Total: ${formatBytes(internalTotal)}\n")
                append("- Used: ${formatBytes(internalUsed)}\n")
                append("- Available: ${formatBytes(internalAvailable)}\n")
                append("- Usage: ${(internalUsed * 100 / internalTotal)}%")
                
                if (Environment.getExternalStorageState() == Environment.MEDIA_MOUNTED) {
                    val externalPath = Environment.getExternalStorageDirectory()
                    val externalStat = StatFs(externalPath.path)
                    
                    val externalTotal = externalStat.blockCountLong * externalStat.blockSizeLong
                    val externalAvailable = externalStat.availableBlocksLong * externalStat.blockSizeLong
                    val externalUsed = externalTotal - externalAvailable
                    
                    append("\n\nExternal Storage:\n")
                    append("- Total: ${formatBytes(externalTotal)}\n")
                    append("- Used: ${formatBytes(externalUsed)}\n")
                    append("- Available: ${formatBytes(externalAvailable)}\n")
                    append("- Usage: ${(externalUsed * 100 / externalTotal)}%")
                }
            }
            
            ToolResult.Success(
                result = result,
                data = mapOf(
                    "internal" to mapOf(
                        "total" to internalTotal,
                        "used" to internalUsed,
                        "available" to internalAvailable
                    )
                )
            )
        } catch (e: Exception) {
            ToolResult.Error("Failed to get storage info: ${e.message}")
        }
    }
    
    private fun formatBytes(bytes: Long): String {
        val df = DecimalFormat("#.##")
        return when {
            bytes < 1024 -> "$bytes B"
            bytes < 1024 * 1024 -> "${df.format(bytes / 1024.0)} KB"
            bytes < 1024 * 1024 * 1024 -> "${df.format(bytes / (1024.0 * 1024))} MB"
            else -> "${df.format(bytes / (1024.0 * 1024 * 1024))} GB"
        }
    }
}
