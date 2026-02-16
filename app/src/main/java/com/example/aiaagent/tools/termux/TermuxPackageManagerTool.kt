package com.example.aiaagent.tools.termux

import android.content.Context
import com.example.aiaagent.tools.Tool
import com.example.aiaagent.tools.ToolResult

/**
 * Manage Termux packages (install, remove, list, search, upgrade).
 */
class TermuxPackageManagerTool : Tool {
    override val name = "termux_package"
    override val description = "Manage Termux packages. Install, remove, list, search, or upgrade packages " +
            "in the Termux environment. Uses pkg/apt package manager. " +
            "Examples: install python, list installed packages, search for nodejs, upgrade all packages."
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "action" to mapOf(
                "type" to "string",
                "description" to "Package action: 'install', 'remove', 'list', 'search', 'upgrade', 'info', 'show'"
            ),
            "package_name" to mapOf(
                "type" to "string",
                "description" to "Name of the package (required for install, remove, search, info)"
            )
        ),
        "required" to listOf("action")
    )

    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        val action = arguments["action"] as? String
            ?: return ToolResult.Error("Action is required")
        val packageName = arguments["package_name"] as? String

        val bridge = TermuxBridge(context)

        if (!bridge.isTermuxInstalled()) {
            return ToolResult.Error("Termux is not installed.")
        }

        val command = when (action.lowercase()) {
            "install" -> {
                if (packageName.isNullOrBlank()) return ToolResult.Error("Package name is required for install")
                "pkg install -y $packageName"
            }
            "remove", "uninstall" -> {
                if (packageName.isNullOrBlank()) return ToolResult.Error("Package name is required for remove")
                "pkg uninstall -y $packageName"
            }
            "list", "list-installed" -> "pkg list-installed 2>/dev/null"
            "search" -> {
                if (packageName.isNullOrBlank()) return ToolResult.Error("Package name is required for search")
                "pkg search $packageName 2>/dev/null"
            }
            "upgrade", "update" -> "pkg update -y && pkg upgrade -y"
            "info", "show" -> {
                if (packageName.isNullOrBlank()) return ToolResult.Error("Package name is required for info")
                "pkg show $packageName 2>/dev/null"
            }
            else -> return ToolResult.Error("Unknown action: $action. Use: install, remove, list, search, upgrade, info")
        }

        val timeoutMs = if (action in listOf("install", "upgrade", "update")) {
            TermuxBridge.LONG_TIMEOUT_MS
        } else {
            TermuxBridge.DEFAULT_TIMEOUT_MS
        }

        val result = bridge.executeCommand(command = command, timeoutMs = timeoutMs)

        return if (result.success) {
            ToolResult.Success(
                result = "Package operation '$action' completed:\n${result.toDisplayString()}",
                data = mapOf(
                    "action" to action,
                    "package" to (packageName ?: ""),
                    "output" to result.stdout
                )
            )
        } else {
            ToolResult.Error("Package operation failed: ${result.toDisplayString()}")
        }
    }
}
