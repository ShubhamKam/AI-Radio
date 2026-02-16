package com.example.aiaagent.tools

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader

class TermuxPackageTool : Tool {
    override val name = "termux_package"
    override val description = "Manage Termux packages: install, uninstall, update, search, and list packages using pkg/apt commands"
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "operation" to mapOf(
                "type" to "string",
                "enum" to listOf("install", "uninstall", "update", "upgrade", "search", "list", "info"),
                "description" to "Package operation: install, uninstall, update (update repos), upgrade (upgrade all), search, list (installed), info (package details)"
            ),
            "package_name" to mapOf(
                "type" to "string",
                "description" to "Package name (required for install, uninstall, search, info operations)"
            ),
            "yes_to_prompts" to mapOf(
                "type" to "boolean",
                "description" to "Automatically answer yes to prompts. Defaults to true"
            )
        ),
        "required" to listOf("operation")
    )

    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        val operation = arguments["operation"] as? String
        val packageName = arguments["package_name"] as? String
        val yesToPrompts = arguments["yes_to_prompts"] as? Boolean ?: true

        if (operation.isNullOrBlank()) {
            return ToolResult.Error("Operation is required")
        }

        // Check if Termux is available
        if (!isTermuxAvailable()) {
            return ToolResult.Error("Termux is not installed or not accessible on this device")
        }

        return try {
            withContext(Dispatchers.IO) {
                when (operation) {
                    "install" -> {
                        if (packageName.isNullOrBlank()) {
                            return@withContext ToolResult.Error("Package name is required for install operation")
                        }
                        installPackage(packageName, yesToPrompts)
                    }
                    "uninstall" -> {
                        if (packageName.isNullOrBlank()) {
                            return@withContext ToolResult.Error("Package name is required for uninstall operation")
                        }
                        uninstallPackage(packageName, yesToPrompts)
                    }
                    "update" -> updateRepositories(yesToPrompts)
                    "upgrade" -> upgradePackages(yesToPrompts)
                    "search" -> {
                        if (packageName.isNullOrBlank()) {
                            return@withContext ToolResult.Error("Package name is required for search operation")
                        }
                        searchPackage(packageName)
                    }
                    "list" -> listInstalledPackages()
                    "info" -> {
                        if (packageName.isNullOrBlank()) {
                            return@withContext ToolResult.Error("Package name is required for info operation")
                        }
                        getPackageInfo(packageName)
                    }
                    else -> ToolResult.Error("Unknown operation: $operation")
                }
            }
        } catch (e: Exception) {
            ToolResult.Error("Package operation failed: ${e.message}")
        }
    }

    private fun isTermuxAvailable(): Boolean {
        return try {
            val pkgBinary = java.io.File("/data/data/com.termux/files/usr/bin/pkg")
            pkgBinary.exists()
        } catch (e: Exception) {
            false
        }
    }

    private fun executeTermuxCommand(command: String, timeoutSeconds: Int = 120): ToolResult {
        return try {
            val processBuilder = ProcessBuilder()
            processBuilder.command(
                "/data/data/com.termux/files/usr/bin/sh",
                "-c",
                command
            )
            processBuilder.redirectErrorStream(true)

            // Set Termux environment
            val env = processBuilder.environment()
            env["PREFIX"] = "/data/data/com.termux/files/usr"
            env["HOME"] = "/data/data/com.termux/files/home"
            env["PATH"] = "/data/data/com.termux/files/usr/bin:/data/data/com.termux/files/usr/bin/applets"

            val process = processBuilder.start()

            val output = StringBuilder()
            val reader = BufferedReader(InputStreamReader(process.inputStream))

            val startTime = System.currentTimeMillis()
            var line: String?

            while (reader.readLine().also { line = it } != null) {
                output.append(line).append("\n")

                if ((System.currentTimeMillis() - startTime) / 1000 > timeoutSeconds) {
                    process.destroy()
                    return ToolResult.Error("Command timed out after $timeoutSeconds seconds\nPartial output:\n$output")
                }
            }

            val exitCode = process.waitFor()
            val result = output.toString().trim()

            if (exitCode == 0) {
                ToolResult.Success(
                    result = if (result.isEmpty()) "Operation completed successfully" else result,
                    data = mapOf(
                        "exit_code" to exitCode,
                        "output" to result
                    )
                )
            } else {
                ToolResult.Error("Operation failed with exit code $exitCode\nOutput:\n$result")
            }
        } catch (e: Exception) {
            ToolResult.Error("Failed to execute command: ${e.message}")
        }
    }

    private fun installPackage(packageName: String, yesToPrompts: Boolean): ToolResult {
        val yesFlag = if (yesToPrompts) "-y" else ""
        return executeTermuxCommand("pkg install $yesFlag $packageName", 300)
    }

    private fun uninstallPackage(packageName: String, yesToPrompts: Boolean): ToolResult {
        val yesFlag = if (yesToPrompts) "-y" else ""
        return executeTermuxCommand("pkg uninstall $yesFlag $packageName", 120)
    }

    private fun updateRepositories(yesToPrompts: Boolean): ToolResult {
        val yesFlag = if (yesToPrompts) "-y" else ""
        return executeTermuxCommand("pkg update $yesFlag", 180)
    }

    private fun upgradePackages(yesToPrompts: Boolean): ToolResult {
        val yesFlag = if (yesToPrompts) "-y" else ""
        return executeTermuxCommand("pkg upgrade $yesFlag", 600)
    }

    private fun searchPackage(packageName: String): ToolResult {
        return executeTermuxCommand("pkg search $packageName", 60)
    }

    private fun listInstalledPackages(): ToolResult {
        return executeTermuxCommand("pkg list-installed", 60)
    }

    private fun getPackageInfo(packageName: String): ToolResult {
        return executeTermuxCommand("pkg show $packageName", 30)
    }
}
