package com.example.aiaagent.tools

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader

class ExecuteCommandTool : Tool {
    override val name = "execute_command"
    override val description = "Execute shell commands on the Android device. Can run any terminal command including Termux commands."
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "command" to mapOf(
                "type" to "string",
                "description" to "The shell command to execute (e.g., 'ls -la', 'pwd', 'df -h', 'top -n 1')"
            ),
            "working_directory" to mapOf(
                "type" to "string",
                "description" to "Optional working directory for command execution. Defaults to /data/data/com.example.aiaagent"
            ),
            "timeout_seconds" to mapOf(
                "type" to "number",
                "description" to "Optional timeout in seconds. Defaults to 30 seconds"
            )
        ),
        "required" to listOf("command")
    )

    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        val command = arguments["command"] as? String
        val workingDir = arguments["working_directory"] as? String
        val timeoutSeconds = (arguments["timeout_seconds"] as? Number)?.toInt() ?: 30

        if (command.isNullOrBlank()) {
            return ToolResult.Error("Command cannot be empty")
        }

        return try {
            withContext(Dispatchers.IO) {
                executeShellCommand(command, workingDir, timeoutSeconds)
            }
        } catch (e: Exception) {
            ToolResult.Error("Command execution failed: ${e.message}")
        }
    }

    private fun executeShellCommand(
        command: String,
        workingDir: String?,
        timeoutSeconds: Int
    ): ToolResult {
        return try {
            val processBuilder = ProcessBuilder()

            // Check if Termux is available and use its shell
            val shell = if (isTermuxAvailable()) {
                listOf("/data/data/com.termux/files/usr/bin/sh", "-c", command)
            } else {
                listOf("/system/bin/sh", "-c", command)
            }

            processBuilder.command(shell)

            // Set working directory if provided
            workingDir?.let {
                val dir = java.io.File(it)
                if (dir.exists() && dir.isDirectory) {
                    processBuilder.directory(dir)
                }
            }

            // Redirect error stream to output stream
            processBuilder.redirectErrorStream(true)

            val process = processBuilder.start()

            // Read output
            val output = StringBuilder()
            val reader = BufferedReader(InputStreamReader(process.inputStream))

            // Read output with timeout
            val startTime = System.currentTimeMillis()
            var line: String?

            while (reader.readLine().also { line = it } != null) {
                output.append(line).append("\n")

                // Check timeout
                if ((System.currentTimeMillis() - startTime) / 1000 > timeoutSeconds) {
                    process.destroy()
                    return ToolResult.Error("Command timed out after $timeoutSeconds seconds\nPartial output:\n$output")
                }
            }

            val exitCode = process.waitFor()

            val result = output.toString().trim()

            if (exitCode == 0) {
                ToolResult.Success(
                    result = if (result.isEmpty()) "Command executed successfully (no output)" else result,
                    data = mapOf(
                        "exit_code" to exitCode,
                        "command" to command,
                        "output" to result
                    )
                )
            } else {
                ToolResult.Error(
                    "Command failed with exit code $exitCode\nOutput:\n$result"
                )
            }
        } catch (e: Exception) {
            ToolResult.Error("Failed to execute command: ${e.message}")
        }
    }

    private fun isTermuxAvailable(): Boolean {
        return try {
            val termuxShell = java.io.File("/data/data/com.termux/files/usr/bin/sh")
            termuxShell.exists()
        } catch (e: Exception) {
            false
        }
    }
}
