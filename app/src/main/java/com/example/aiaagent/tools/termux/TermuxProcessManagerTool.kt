package com.example.aiaagent.tools.termux

import android.content.Context
import com.example.aiaagent.tools.Tool
import com.example.aiaagent.tools.ToolResult

/**
 * Manage processes running in the Termux environment.
 */
class TermuxProcessManagerTool : Tool {
    override val name = "termux_process"
    override val description = "Manage processes in the Termux environment. List running processes, " +
            "kill processes by PID or name, check resource usage (top), and manage background jobs."
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "action" to mapOf(
                "type" to "string",
                "description" to "Process action: 'list', 'kill', 'top', 'jobs', 'killall'"
            ),
            "pid" to mapOf(
                "type" to "number",
                "description" to "Process ID (required for 'kill' action)"
            ),
            "process_name" to mapOf(
                "type" to "string",
                "description" to "Process name (for 'killall' or filtering 'list')"
            ),
            "signal" to mapOf(
                "type" to "string",
                "description" to "Signal to send (default: TERM). Options: TERM, KILL, HUP, INT, STOP, CONT"
            )
        ),
        "required" to listOf("action")
    )

    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        val action = arguments["action"] as? String
            ?: return ToolResult.Error("Action is required")
        val pid = (arguments["pid"] as? Number)?.toInt()
        val processName = arguments["process_name"] as? String
        val signal = arguments["signal"] as? String ?: "TERM"

        val bridge = TermuxBridge(context)

        if (!bridge.isTermuxInstalled()) {
            return ToolResult.Error("Termux is not installed.")
        }

        val command = when (action.lowercase()) {
            "list", "ps" -> {
                if (processName != null) {
                    "ps aux 2>/dev/null | grep -i '$processName' | grep -v grep || ps -ef | grep -i '$processName' | grep -v grep"
                } else {
                    "ps aux 2>/dev/null || ps -ef"
                }
            }
            "kill" -> {
                if (pid == null) return ToolResult.Error("PID is required for kill action")
                "kill -s $signal $pid && echo 'Signal $signal sent to process $pid'"
            }
            "killall" -> {
                if (processName == null) return ToolResult.Error("Process name is required for killall action")
                "killall -s $signal '$processName' 2>/dev/null && echo 'Signal $signal sent to all $processName processes' || echo 'No matching processes found'"
            }
            "top" -> "top -bn1 | head -30"
            "jobs" -> "jobs -l 2>/dev/null || echo 'No background jobs'"
            else -> return ToolResult.Error("Unknown action: $action. Use: list, kill, killall, top, jobs")
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
            ToolResult.Error("Process operation failed: ${result.toDisplayString()}")
        }
    }
}
