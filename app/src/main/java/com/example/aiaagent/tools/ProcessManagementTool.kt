package com.example.aiaagent.tools

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader

class ProcessManagementTool : Tool {
    override val name = "process_management"
    override val description = "Manage running processes: list processes, get process info, kill processes, check if process is running"
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "operation" to mapOf(
                "type" to "string",
                "enum" to listOf("list", "info", "kill", "check", "top"),
                "description" to "Process operation: list (all processes), info (detailed process info), kill (terminate process), check (check if running), top (system resource usage)"
            ),
            "process_name" to mapOf(
                "type" to "string",
                "description" to "Process name or pattern to search for (for info, kill, check operations)"
            ),
            "pid" to mapOf(
                "type" to "number",
                "description" to "Process ID (for kill operation)"
            ),
            "signal" to mapOf(
                "type" to "string",
                "description" to "Signal to send when killing process (default: TERM). Options: TERM, KILL, INT, HUP"
            ),
            "limit" to mapOf(
                "type" to "number",
                "description" to "Limit number of results (for list operation, default: 50)"
            )
        ),
        "required" to listOf("operation")
    )

    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        val operation = arguments["operation"] as? String
        val processName = arguments["process_name"] as? String
        val pid = (arguments["pid"] as? Number)?.toInt()
        val signal = arguments["signal"] as? String ?: "TERM"
        val limit = (arguments["limit"] as? Number)?.toInt() ?: 50

        if (operation.isNullOrBlank()) {
            return ToolResult.Error("Operation is required")
        }

        return try {
            withContext(Dispatchers.IO) {
                when (operation) {
                    "list" -> listProcesses(limit)
                    "info" -> {
                        if (processName.isNullOrBlank() && pid == null) {
                            return@withContext ToolResult.Error("Process name or PID is required for info operation")
                        }
                        getProcessInfo(processName, pid)
                    }
                    "kill" -> {
                        if (pid == null && processName.isNullOrBlank()) {
                            return@withContext ToolResult.Error("Process name or PID is required for kill operation")
                        }
                        killProcess(processName, pid, signal)
                    }
                    "check" -> {
                        if (processName.isNullOrBlank()) {
                            return@withContext ToolResult.Error("Process name is required for check operation")
                        }
                        checkProcess(processName)
                    }
                    "top" -> getTopProcesses()
                    else -> ToolResult.Error("Unknown operation: $operation")
                }
            }
        } catch (e: Exception) {
            ToolResult.Error("Process management operation failed: ${e.message}")
        }
    }

    private fun listProcesses(limit: Int): ToolResult {
        return executeCommand("ps -A | head -n $limit")
    }

    private fun getProcessInfo(processName: String?, pid: Int?): ToolResult {
        return if (pid != null) {
            executeCommand("ps -p $pid -o pid,ppid,user,stat,time,cmd")
        } else {
            executeCommand("ps -A | grep -i '$processName'")
        }
    }

    private fun killProcess(processName: String?, pid: Int?, signal: String): ToolResult {
        // Validate signal
        val validSignals = listOf("TERM", "KILL", "INT", "HUP", "STOP", "CONT")
        if (signal !in validSignals) {
            return ToolResult.Error("Invalid signal: $signal. Valid signals: ${validSignals.joinToString(", ")}")
        }

        return if (pid != null) {
            executeCommand("kill -$signal $pid")
        } else if (!processName.isNullOrBlank()) {
            // Find PID by name first
            val findPidResult = executeCommand("pidof $processName")
            if (findPidResult is ToolResult.Success) {
                val foundPid = findPidResult.result.trim().split(" ").firstOrNull()
                if (foundPid != null) {
                    executeCommand("kill -$signal $foundPid")
                } else {
                    ToolResult.Error("Process '$processName' not found")
                }
            } else {
                ToolResult.Error("Failed to find process '$processName'")
            }
        } else {
            ToolResult.Error("Process name or PID is required")
        }
    }

    private fun checkProcess(processName: String): ToolResult {
        val result = executeCommand("pgrep -l '$processName'")

        return if (result is ToolResult.Success) {
            val output = result.result.trim()
            if (output.isNotEmpty()) {
                val lines = output.lines()
                ToolResult.Success(
                    result = "Process '$processName' is running\nFound ${lines.size} instance(s):\n$output",
                    data = mapOf(
                        "running" to true,
                        "instances" to lines.size,
                        "processes" to output
                    )
                )
            } else {
                ToolResult.Success(
                    result = "Process '$processName' is not running",
                    data = mapOf("running" to false)
                )
            }
        } else {
            ToolResult.Success(
                result = "Process '$processName' is not running",
                data = mapOf("running" to false)
            )
        }
    }

    private fun getTopProcesses(): ToolResult {
        return executeCommand("top -b -n 1 | head -n 20")
    }

    private fun executeCommand(command: String, timeoutSeconds: Int = 30): ToolResult {
        return try {
            val processBuilder = ProcessBuilder()
            processBuilder.command("/system/bin/sh", "-c", command)
            processBuilder.redirectErrorStream(true)

            val process = processBuilder.start()

            val output = StringBuilder()
            val reader = BufferedReader(InputStreamReader(process.inputStream))

            val startTime = System.currentTimeMillis()
            var line: String?

            while (reader.readLine().also { line = it } != null) {
                output.append(line).append("\n")

                if ((System.currentTimeMillis() - startTime) / 1000 > timeoutSeconds) {
                    process.destroy()
                    return ToolResult.Error("Command timed out after $timeoutSeconds seconds")
                }
            }

            val exitCode = process.waitFor()
            val result = output.toString().trim()

            if (exitCode == 0) {
                ToolResult.Success(
                    result = if (result.isEmpty()) "Operation completed successfully (no output)" else result,
                    data = mapOf(
                        "exit_code" to exitCode,
                        "output" to result
                    )
                )
            } else {
                ToolResult.Error("Command failed with exit code $exitCode\nOutput:\n$result")
            }
        } catch (e: Exception) {
            ToolResult.Error("Failed to execute command: ${e.message}")
        }
    }
}
