package com.example.aiaagent.tools.termux

import android.content.Context
import com.example.aiaagent.tools.Tool
import com.example.aiaagent.tools.ToolResult

/**
 * Run scripts (Python, Bash, Node.js, Ruby, etc.) in the Termux environment.
 */
class TermuxScriptRunnerTool : Tool {
    override val name = "termux_script"
    override val description = "Create and run scripts in Termux. Supports Python, Bash, Node.js, Ruby, Perl, " +
            "and other scripting languages installed in Termux. Can create a script file and execute it, " +
            "or run inline code directly."
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "language" to mapOf(
                "type" to "string",
                "description" to "Script language: 'python', 'bash', 'node', 'ruby', 'perl', 'php'"
            ),
            "code" to mapOf(
                "type" to "string",
                "description" to "The script code to execute"
            ),
            "script_path" to mapOf(
                "type" to "string",
                "description" to "Path to an existing script file to run (alternative to 'code')"
            ),
            "arguments" to mapOf(
                "type" to "string",
                "description" to "Command-line arguments to pass to the script"
            ),
            "save_as" to mapOf(
                "type" to "string",
                "description" to "Save the script to this filename before running (in Termux home)"
            )
        ),
        "required" to listOf("language")
    )

    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        val language = arguments["language"] as? String
            ?: return ToolResult.Error("Language is required")
        val code = arguments["code"] as? String
        val scriptPath = arguments["script_path"] as? String
        val scriptArgs = arguments["arguments"] as? String ?: ""
        val saveAs = arguments["save_as"] as? String

        if (code == null && scriptPath == null) {
            return ToolResult.Error("Either 'code' or 'script_path' must be provided")
        }

        val bridge = TermuxBridge(context)

        if (!bridge.isTermuxInstalled()) {
            return ToolResult.Error("Termux is not installed.")
        }

        val interpreter = getInterpreter(language)
            ?: return ToolResult.Error("Unsupported language: $language. Supported: python, bash, node, ruby, perl, php")

        val command = if (code != null) {
            val filename = saveAs ?: ".aiaagent_temp_script${getExtension(language)}"
            val fullPath = "${TermuxBridge.TERMUX_HOME}/$filename"
            val escapedCode = code.replace("'", "'\\''")

            buildString {
                append("printf '%s' '${escapedCode}' > '$fullPath' && ")
                append("chmod +x '$fullPath' && ")
                append("$interpreter '$fullPath' $scriptArgs")
                if (saveAs == null) {
                    append(" ; rm -f '$fullPath'")
                }
            }
        } else {
            "$interpreter '${scriptPath}' $scriptArgs"
        }

        val result = bridge.executeCommand(
            command = command,
            timeoutMs = TermuxBridge.LONG_TIMEOUT_MS
        )

        return if (result.success) {
            val resultText = buildString {
                if (saveAs != null) {
                    append("Script saved as: ${TermuxBridge.TERMUX_HOME}/$saveAs\n")
                }
                append("Output:\n${result.toDisplayString()}")
            }
            ToolResult.Success(
                result = resultText,
                data = mapOf(
                    "language" to language,
                    "output" to result.stdout,
                    "exit_code" to result.exitCode
                )
            )
        } else {
            ToolResult.Error("Script execution failed:\n${result.toDisplayString()}")
        }
    }

    private fun getInterpreter(language: String): String? {
        return when (language.lowercase()) {
            "python", "python3", "py" -> "python"
            "bash", "sh", "shell" -> "bash"
            "node", "nodejs", "javascript", "js" -> "node"
            "ruby", "rb" -> "ruby"
            "perl", "pl" -> "perl"
            "php" -> "php"
            else -> null
        }
    }

    private fun getExtension(language: String): String {
        return when (language.lowercase()) {
            "python", "python3", "py" -> ".py"
            "bash", "sh", "shell" -> ".sh"
            "node", "nodejs", "javascript", "js" -> ".js"
            "ruby", "rb" -> ".rb"
            "perl", "pl" -> ".pl"
            "php" -> ".php"
            else -> ".txt"
        }
    }
}
