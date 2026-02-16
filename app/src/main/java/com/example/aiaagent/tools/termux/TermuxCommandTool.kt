package com.example.aiaagent.tools.termux

import android.content.Context
import com.example.aiaagent.tools.Tool
import com.example.aiaagent.tools.ToolResult

/**
 * Execute arbitrary shell commands in the Termux environment.
 */
class TermuxCommandTool : Tool {
    override val name = "termux_execute"
    override val description = "Execute a shell command in the Termux terminal environment on this Android device. " +
            "Supports any Linux command available in Termux (ls, cat, grep, awk, sed, git, python, node, etc.). " +
            "Commands run in the Termux home directory by default."
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "command" to mapOf(
                "type" to "string",
                "description" to "The shell command to execute (e.g., 'ls -la', 'pwd', 'echo hello', 'python script.py')"
            ),
            "working_directory" to mapOf(
                "type" to "string",
                "description" to "Working directory for the command (default: Termux home directory)"
            ),
            "background" to mapOf(
                "type" to "boolean",
                "description" to "Run command in background without waiting for output (default: false)"
            ),
            "timeout_seconds" to mapOf(
                "type" to "number",
                "description" to "Timeout in seconds (default: 30, max: 120)"
            )
        ),
        "required" to listOf("command")
    )

    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        val command = arguments["command"] as? String
            ?: return ToolResult.Error("Command is required")

        val workingDir = arguments["working_directory"] as? String ?: TermuxBridge.TERMUX_HOME
        val background = arguments["background"] as? Boolean ?: false
        val timeoutSeconds = (arguments["timeout_seconds"] as? Number)?.toLong() ?: 30L
        val timeoutMs = (timeoutSeconds.coerceIn(1, 120)) * 1000

        val bridge = TermuxBridge(context)

        if (!bridge.isTermuxInstalled()) {
            return ToolResult.Error(
                "Termux is not installed. Please install Termux from F-Droid (https://f-droid.org/packages/com.termux/) " +
                        "and grant the required permissions."
            )
        }

        val result = bridge.executeCommand(
            command = command,
            workingDirectory = workingDir,
            background = background,
            timeoutMs = timeoutMs
        )

        return if (result.success) {
            ToolResult.Success(
                result = result.toDisplayString(),
                data = mapOf(
                    "exit_code" to result.exitCode,
                    "stdout" to result.stdout,
                    "stderr" to result.stderr,
                    "command" to command
                )
            )
        } else {
            ToolResult.Error("Command failed (exit code ${result.exitCode}): ${result.toDisplayString()}")
        }
    }
}
