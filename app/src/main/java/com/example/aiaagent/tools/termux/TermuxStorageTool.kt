package com.example.aiaagent.tools.termux

import android.content.Context
import com.example.aiaagent.tools.Tool
import com.example.aiaagent.tools.ToolResult

/**
 * Manage Termux storage, shared storage access, and disk usage.
 */
class TermuxStorageTool : Tool {
    override val name = "termux_storage"
    override val description = "Manage Termux storage and access shared Android storage. " +
            "Setup shared storage access, check disk usage, manage storage symlinks, " +
            "access Downloads/DCIM/Pictures/Music folders from Termux."
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "action" to mapOf(
                "type" to "string",
                "description" to "Storage action: 'setup', 'usage', 'shared_list', 'downloads', 'dcim', 'pictures', 'music', 'movies', 'documents'"
            ),
            "path" to mapOf(
                "type" to "string",
                "description" to "Specific path to check (for 'usage' action)"
            )
        ),
        "required" to listOf("action")
    )

    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        val action = arguments["action"] as? String
            ?: return ToolResult.Error("Action is required")
        val path = arguments["path"] as? String

        val bridge = TermuxBridge(context)

        if (!bridge.isTermuxInstalled()) {
            return ToolResult.Error("Termux is not installed.")
        }

        val command = when (action.lowercase()) {
            "setup" -> "termux-setup-storage && echo 'Storage setup initiated. Please grant permission if prompted.'"
            "usage", "disk" -> {
                val targetPath = path ?: TermuxBridge.TERMUX_HOME
                "df -h '$targetPath' && echo '\\n--- Directory Size ---' && du -sh '$targetPath' 2>/dev/null"
            }
            "shared_list" -> "ls -la ~/storage/ 2>/dev/null || echo 'Shared storage not set up. Run termux-setup-storage first.'"
            "downloads" -> "ls -la ~/storage/downloads/ 2>/dev/null || echo 'Downloads not accessible. Run termux-setup-storage first.'"
            "dcim" -> "ls -la ~/storage/dcim/ 2>/dev/null || echo 'DCIM not accessible. Run termux-setup-storage first.'"
            "pictures" -> "ls -la ~/storage/pictures/ 2>/dev/null || echo 'Pictures not accessible. Run termux-setup-storage first.'"
            "music" -> "ls -la ~/storage/music/ 2>/dev/null || echo 'Music not accessible. Run termux-setup-storage first.'"
            "movies" -> "ls -la ~/storage/movies/ 2>/dev/null || echo 'Movies not accessible. Run termux-setup-storage first.'"
            "documents" -> "ls -la ~/storage/shared/Documents/ 2>/dev/null || echo 'Documents not accessible. Run termux-setup-storage first.'"
            else -> return ToolResult.Error("Unknown action: $action. Use: setup, usage, shared_list, downloads, dcim, pictures, music, movies, documents")
        }

        val result = bridge.executeCommand(command = command)

        return if (result.success) {
            ToolResult.Success(
                result = result.toDisplayString(),
                data = mapOf(
                    "action" to action,
                    "output" to result.stdout
                )
            )
        } else {
            ToolResult.Error("Storage operation failed: ${result.toDisplayString()}")
        }
    }
}
