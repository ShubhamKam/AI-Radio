package com.example.aiaagent.tools.termux

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.os.Handler
import android.os.Looper
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader

/**
 * Bridge for communicating with Termux app on the same Android device.
 * Uses Termux's RUN_COMMAND intent and Termux:API commands.
 */
class TermuxBridge(private val context: Context) {

    companion object {
        const val TERMUX_PACKAGE = "com.termux"
        const val TERMUX_API_PACKAGE = "com.termux.api"
        const val TERMUX_RUN_COMMAND_SERVICE = "com.termux.app.RunCommandService"
        const val TERMUX_RUN_COMMAND_ACTION = "com.termux.RUN_COMMAND"
        const val TERMUX_HOME = "/data/data/com.termux/files/home"
        const val TERMUX_PREFIX = "/data/data/com.termux/files/usr"
        const val TERMUX_BIN = "$TERMUX_PREFIX/bin"
        const val DEFAULT_TIMEOUT_MS = 30000L
        const val LONG_TIMEOUT_MS = 120000L

        private const val RESULT_DIR_NAME = ".aiaagent_results"
    }

    private val resultDir: File
        get() = File(TERMUX_HOME, RESULT_DIR_NAME).also { it.mkdirs() }

    /**
     * Check if Termux is installed on the device.
     */
    fun isTermuxInstalled(): Boolean {
        return try {
            context.packageManager.getPackageInfo(TERMUX_PACKAGE, 0)
            true
        } catch (e: PackageManager.NameNotFoundException) {
            false
        }
    }

    /**
     * Check if Termux:API is installed on the device.
     */
    fun isTermuxApiInstalled(): Boolean {
        return try {
            context.packageManager.getPackageInfo(TERMUX_API_PACKAGE, 0)
            true
        } catch (e: PackageManager.NameNotFoundException) {
            false
        }
    }

    /**
     * Get Termux installation status summary.
     */
    fun getTermuxStatus(): TermuxStatus {
        return TermuxStatus(
            isTermuxInstalled = isTermuxInstalled(),
            isTermuxApiInstalled = isTermuxApiInstalled(),
            termuxHomePath = TERMUX_HOME,
            termuxPrefixPath = TERMUX_PREFIX
        )
    }

    /**
     * Execute a shell command in Termux environment via RUN_COMMAND intent.
     */
    suspend fun executeCommand(
        command: String,
        arguments: List<String> = emptyList(),
        workingDirectory: String = TERMUX_HOME,
        background: Boolean = false,
        timeoutMs: Long = DEFAULT_TIMEOUT_MS
    ): TermuxCommandResult = withContext(Dispatchers.IO) {
        if (!isTermuxInstalled()) {
            return@withContext TermuxCommandResult(
                exitCode = -1,
                stdout = "",
                stderr = "Termux is not installed. Please install Termux from F-Droid or GitHub.",
                success = false
            )
        }

        try {
            val resultId = System.currentTimeMillis().toString()
            val stdoutFile = File(resultDir, "${resultId}_stdout.txt")
            val stderrFile = File(resultDir, "${resultId}_stderr.txt")
            val exitCodeFile = File(resultDir, "${resultId}_exit.txt")

            // Build a wrapper script that captures output
            val wrappedCommand = buildString {
                append("#!/data/data/com.termux/files/usr/bin/bash\n")
                append("cd ${escapeShellArg(workingDirectory)} 2>/dev/null\n")
                if (arguments.isNotEmpty()) {
                    append("${escapeShellArg(command)} ${arguments.joinToString(" ") { escapeShellArg(it) }}")
                } else {
                    append(command)
                }
                append(" > ${escapeShellArg(stdoutFile.absolutePath)} 2> ${escapeShellArg(stderrFile.absolutePath)}\n")
                append("echo $? > ${escapeShellArg(exitCodeFile.absolutePath)}\n")
            }

            val scriptFile = File(resultDir, "${resultId}_cmd.sh")
            scriptFile.writeText(wrappedCommand)
            scriptFile.setExecutable(true)

            // Send intent to Termux
            val intent = Intent(TERMUX_RUN_COMMAND_ACTION).apply {
                setClassName(TERMUX_PACKAGE, TERMUX_RUN_COMMAND_SERVICE)
                putExtra("com.termux.RUN_COMMAND_PATH", "$TERMUX_BIN/bash")
                putExtra("com.termux.RUN_COMMAND_ARGUMENTS", arrayOf(scriptFile.absolutePath))
                putExtra("com.termux.RUN_COMMAND_WORKDIR", workingDirectory)
                putExtra("com.termux.RUN_COMMAND_BACKGROUND", true)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }

            if (background) {
                return@withContext TermuxCommandResult(
                    exitCode = 0,
                    stdout = "Command started in background: $command",
                    stderr = "",
                    success = true
                )
            }

            // Wait for result with timeout
            val result = withTimeoutOrNull(timeoutMs) {
                waitForResult(exitCodeFile, stdoutFile, stderrFile)
            }

            // Cleanup
            scriptFile.delete()

            if (result != null) {
                result
            } else {
                // Cleanup on timeout
                stdoutFile.delete()
                stderrFile.delete()
                exitCodeFile.delete()
                TermuxCommandResult(
                    exitCode = -1,
                    stdout = "",
                    stderr = "Command timed out after ${timeoutMs / 1000} seconds",
                    success = false
                )
            }
        } catch (e: SecurityException) {
            TermuxCommandResult(
                exitCode = -1,
                stdout = "",
                stderr = "Permission denied. Please grant the RUN_COMMAND permission to this app in Termux settings. " +
                        "Go to Termux → Settings → Allow external apps.",
                success = false
            )
        } catch (e: Exception) {
            TermuxCommandResult(
                exitCode = -1,
                stdout = "",
                stderr = "Failed to execute command: ${e.message}",
                success = false
            )
        }
    }

    private suspend fun waitForResult(
        exitCodeFile: File,
        stdoutFile: File,
        stderrFile: File
    ): TermuxCommandResult {
        // Poll for result file
        var attempts = 0
        val maxAttempts = 600 // 30 seconds at 50ms intervals
        while (!exitCodeFile.exists() && attempts < maxAttempts) {
            kotlinx.coroutines.delay(50)
            attempts++
        }

        if (!exitCodeFile.exists()) {
            return TermuxCommandResult(
                exitCode = -1,
                stdout = stdoutFile.takeIf { it.exists() }?.readText() ?: "",
                stderr = "Command did not complete in time",
                success = false
            )
        }

        // Small delay to ensure files are fully written
        kotlinx.coroutines.delay(100)

        val exitCode = exitCodeFile.readText().trim().toIntOrNull() ?: -1
        val stdout = stdoutFile.takeIf { it.exists() }?.readText() ?: ""
        val stderr = stderrFile.takeIf { it.exists() }?.readText() ?: ""

        // Cleanup result files
        exitCodeFile.delete()
        stdoutFile.delete()
        stderrFile.delete()

        return TermuxCommandResult(
            exitCode = exitCode,
            stdout = stdout.trimEnd(),
            stderr = stderr.trimEnd(),
            success = exitCode == 0
        )
    }

    /**
     * Execute a Termux:API command.
     */
    suspend fun executeTermuxApi(
        apiCommand: String,
        arguments: List<String> = emptyList(),
        timeoutMs: Long = DEFAULT_TIMEOUT_MS
    ): TermuxCommandResult {
        val fullCommand = buildString {
            append("$TERMUX_BIN/$apiCommand")
            if (arguments.isNotEmpty()) {
                append(" ")
                append(arguments.joinToString(" ") { escapeShellArg(it) })
            }
        }
        return executeCommand(fullCommand, timeoutMs = timeoutMs)
    }

    private fun escapeShellArg(arg: String): String {
        return "'" + arg.replace("'", "'\\''") + "'"
    }

    /**
     * Open Termux app.
     */
    fun openTermux() {
        val intent = context.packageManager.getLaunchIntentForPackage(TERMUX_PACKAGE)
        if (intent != null) {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        }
    }
}

data class TermuxStatus(
    val isTermuxInstalled: Boolean,
    val isTermuxApiInstalled: Boolean,
    val termuxHomePath: String,
    val termuxPrefixPath: String
) {
    val isFullySetup: Boolean
        get() = isTermuxInstalled && isTermuxApiInstalled

    fun toSummary(): String = buildString {
        append("Termux Status:\n")
        append("• Termux App: ${if (isTermuxInstalled) "✅ Installed" else "❌ Not Installed"}\n")
        append("• Termux:API: ${if (isTermuxApiInstalled) "✅ Installed" else "❌ Not Installed"}\n")
        append("• Home Path: $termuxHomePath\n")
        append("• Prefix Path: $termuxPrefixPath")
    }
}

data class TermuxCommandResult(
    val exitCode: Int,
    val stdout: String,
    val stderr: String,
    val success: Boolean
) {
    fun toDisplayString(): String = buildString {
        if (stdout.isNotBlank()) append(stdout)
        if (stderr.isNotBlank()) {
            if (isNotBlank()) append("\n")
            append("stderr: $stderr")
        }
        if (isEmpty()) append("(no output)")
    }

    fun toDetailedString(): String = buildString {
        append("Exit Code: $exitCode\n")
        if (stdout.isNotBlank()) append("Output:\n$stdout\n")
        if (stderr.isNotBlank()) append("Errors:\n$stderr\n")
        if (stdout.isBlank() && stderr.isBlank()) append("(no output)\n")
    }
}
