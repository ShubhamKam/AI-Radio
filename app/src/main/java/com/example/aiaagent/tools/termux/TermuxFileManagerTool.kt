package com.example.aiaagent.tools.termux

import android.content.Context
import com.example.aiaagent.tools.Tool
import com.example.aiaagent.tools.ToolResult

/**
 * Browse, read, write, and manage files in the Termux filesystem.
 */
class TermuxFileManagerTool : Tool {
    override val name = "termux_file"
    override val description = "Manage files in the Termux filesystem. Browse directories, read file contents, " +
            "write/create files, delete files, move/copy files, check file permissions, and search for files. " +
            "Works within the Termux home directory and shared storage."
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "action" to mapOf(
                "type" to "string",
                "description" to "File action: 'list', 'read', 'write', 'delete', 'move', 'copy', 'mkdir', 'search', 'info', 'tree'"
            ),
            "path" to mapOf(
                "type" to "string",
                "description" to "File or directory path (relative to Termux home or absolute)"
            ),
            "content" to mapOf(
                "type" to "string",
                "description" to "Content to write (required for 'write' action)"
            ),
            "destination" to mapOf(
                "type" to "string",
                "description" to "Destination path (required for 'move' and 'copy' actions)"
            ),
            "pattern" to mapOf(
                "type" to "string",
                "description" to "Search pattern (for 'search' action, uses find/grep)"
            )
        ),
        "required" to listOf("action")
    )

    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        val action = arguments["action"] as? String
            ?: return ToolResult.Error("Action is required")
        val path = arguments["path"] as? String ?: "."
        val content = arguments["content"] as? String
        val destination = arguments["destination"] as? String
        val pattern = arguments["pattern"] as? String

        val bridge = TermuxBridge(context)

        if (!bridge.isTermuxInstalled()) {
            return ToolResult.Error("Termux is not installed.")
        }

        val resolvedPath = resolvePath(path)

        val command = when (action.lowercase()) {
            "list", "ls" -> "ls -la $resolvedPath"
            "read", "cat" -> {
                "cat $resolvedPath"
            }
            "write", "create" -> {
                if (content == null) return ToolResult.Error("Content is required for write action")
                val escapedContent = content.replace("'", "'\\''")
                "printf '%s' '$escapedContent' > $resolvedPath && echo 'File written successfully: $resolvedPath'"
            }
            "delete", "rm" -> "rm -rf $resolvedPath && echo 'Deleted: $resolvedPath'"
            "move", "mv" -> {
                if (destination == null) return ToolResult.Error("Destination is required for move action")
                val resolvedDest = resolvePath(destination)
                "mv $resolvedPath $resolvedDest && echo 'Moved to: $resolvedDest'"
            }
            "copy", "cp" -> {
                if (destination == null) return ToolResult.Error("Destination is required for copy action")
                val resolvedDest = resolvePath(destination)
                "cp -r $resolvedPath $resolvedDest && echo 'Copied to: $resolvedDest'"
            }
            "mkdir" -> "mkdir -p $resolvedPath && echo 'Directory created: $resolvedPath'"
            "search", "find" -> {
                val searchPattern = pattern ?: path
                "find ${TermuxBridge.TERMUX_HOME} -name '*$searchPattern*' -type f 2>/dev/null | head -50"
            }
            "info", "stat" -> "stat $resolvedPath && echo '---' && file $resolvedPath"
            "tree" -> "find $resolvedPath -maxdepth 3 -print 2>/dev/null | head -100 | sed 's|[^/]*/|  |g'"
            else -> return ToolResult.Error("Unknown action: $action. Use: list, read, write, delete, move, copy, mkdir, search, info, tree")
        }

        val result = bridge.executeCommand(command = command)

        return if (result.success) {
            ToolResult.Success(
                result = result.toDisplayString(),
                data = mapOf(
                    "action" to action,
                    "path" to resolvedPath,
                    "output" to result.stdout
                )
            )
        } else {
            ToolResult.Error("File operation failed: ${result.toDisplayString()}")
        }
    }

    private fun resolvePath(path: String): String {
        return if (path.startsWith("/")) {
            path
        } else {
            "${TermuxBridge.TERMUX_HOME}/$path"
        }
    }
}
