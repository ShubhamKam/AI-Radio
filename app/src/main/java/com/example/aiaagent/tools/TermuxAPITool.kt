package com.example.aiaagent.tools

import android.content.Context
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader

class TermuxAPITool : Tool {
    override val name = "termux_api"
    override val description = "Access Termux-API features: clipboard, camera, location, sensors, notifications, contacts, SMS, calls, brightness, volume, torch, vibration"
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "api_function" to mapOf(
                "type" to "string",
                "enum" to listOf(
                    "clipboard_get", "clipboard_set",
                    "camera_info", "camera_photo",
                    "location", "battery_status",
                    "brightness", "volume",
                    "notification", "toast",
                    "vibrate", "torch",
                    "wifi_connectioninfo", "wifi_scaninfo",
                    "sensor_list", "sensor_read",
                    "contact_list", "call_log",
                    "sms_list", "sms_send"
                ),
                "description" to "Termux-API function to execute"
            ),
            "params" to mapOf(
                "type" to "object",
                "description" to "Additional parameters specific to the API function (e.g., {\"text\": \"hello\"} for clipboard_set)"
            )
        ),
        "required" to listOf("api_function")
    )

    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        val apiFunction = arguments["api_function"] as? String
        val params = arguments["params"] as? Map<String, Any> ?: emptyMap()

        if (apiFunction.isNullOrBlank()) {
            return ToolResult.Error("API function is required")
        }

        if (!isTermuxAPIAvailable()) {
            return ToolResult.Error(
                "Termux-API is not installed. Install it from F-Droid or Google Play Store, " +
                "then install the package in Termux using: pkg install termux-api"
            )
        }

        return try {
            withContext(Dispatchers.IO) {
                when (apiFunction) {
                    // Clipboard operations
                    "clipboard_get" -> executeAPICommand("termux-clipboard-get")
                    "clipboard_set" -> {
                        val text = params["text"] as? String ?: ""
                        executeAPICommandWithInput("termux-clipboard-set", text)
                    }

                    // Camera operations
                    "camera_info" -> executeAPICommand("termux-camera-info")
                    "camera_photo" -> {
                        val camera = params["camera"] as? String ?: "0"
                        val output = params["output"] as? String ?: "/sdcard/photo.jpg"
                        executeAPICommand("termux-camera-photo -c $camera $output")
                    }

                    // Location
                    "location" -> {
                        val provider = params["provider"] as? String ?: "gps"
                        val request = params["request"] as? String ?: "once"
                        executeAPICommand("termux-location -p $provider -r $request")
                    }

                    // Battery status
                    "battery_status" -> executeAPICommand("termux-battery-status")

                    // Brightness control
                    "brightness" -> {
                        val value = params["value"] as? Number
                        if (value != null) {
                            executeAPICommand("termux-brightness ${value.toInt()}")
                        } else {
                            executeAPICommand("termux-brightness")
                        }
                    }

                    // Volume control
                    "volume" -> {
                        val stream = params["stream"] as? String ?: "music"
                        val value = params["value"] as? Number
                        if (value != null) {
                            executeAPICommand("termux-volume $stream ${value.toInt()}")
                        } else {
                            executeAPICommand("termux-volume $stream")
                        }
                    }

                    // Notification
                    "notification" -> {
                        val title = params["title"] as? String ?: "Notification"
                        val content = params["content"] as? String ?: ""
                        executeAPICommand("termux-notification -t '$title' -c '$content'")
                    }

                    // Toast message
                    "toast" -> {
                        val text = params["text"] as? String ?: "Hello"
                        val gravity = params["gravity"] as? String ?: "middle"
                        executeAPICommand("termux-toast -g $gravity '$text'")
                    }

                    // Vibrate
                    "vibrate" -> {
                        val duration = params["duration"] as? Number ?: 1000
                        executeAPICommand("termux-vibrate -d ${duration.toInt()}")
                    }

                    // Torch/Flashlight
                    "torch" -> {
                        val enabled = params["enabled"] as? Boolean ?: true
                        val state = if (enabled) "on" else "off"
                        executeAPICommand("termux-torch $state")
                    }

                    // WiFi operations
                    "wifi_connectioninfo" -> executeAPICommand("termux-wifi-connectioninfo")
                    "wifi_scaninfo" -> executeAPICommand("termux-wifi-scaninfo")

                    // Sensor operations
                    "sensor_list" -> executeAPICommand("termux-sensor -l")
                    "sensor_read" -> {
                        val sensor = params["sensor"] as? String ?: "all"
                        val delay = params["delay"] as? Number ?: 1000
                        val limit = params["limit"] as? Number ?: 1
                        executeAPICommand("termux-sensor -s $sensor -d ${delay.toInt()} -n ${limit.toInt()}")
                    }

                    // Contact operations
                    "contact_list" -> executeAPICommand("termux-contact-list")

                    // Call log
                    "call_log" -> {
                        val limit = params["limit"] as? Number ?: 10
                        executeAPICommand("termux-call-log -l ${limit.toInt()}")
                    }

                    // SMS operations
                    "sms_list" -> {
                        val limit = params["limit"] as? Number ?: 10
                        val type = params["type"] as? String ?: "inbox"
                        executeAPICommand("termux-sms-list -t $type -l ${limit.toInt()}")
                    }
                    "sms_send" -> {
                        val number = params["number"] as? String
                        val text = params["text"] as? String
                        if (number.isNullOrBlank() || text.isNullOrBlank()) {
                            return@withContext ToolResult.Error("SMS send requires 'number' and 'text' parameters")
                        }
                        executeAPICommand("termux-sms-send -n $number '$text'")
                    }

                    else -> ToolResult.Error("Unknown API function: $apiFunction")
                }
            }
        } catch (e: Exception) {
            ToolResult.Error("Termux-API operation failed: ${e.message}")
        }
    }

    private fun isTermuxAPIAvailable(): Boolean {
        return try {
            // Check if termux-api package is installed
            val apiScript = java.io.File("/data/data/com.termux/files/usr/bin/termux-battery-status")
            apiScript.exists()
        } catch (e: Exception) {
            false
        }
    }

    private fun executeAPICommand(command: String, timeoutSeconds: Int = 30): ToolResult {
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
            ToolResult.Error("Failed to execute API command: ${e.message}")
        }
    }

    private fun executeAPICommandWithInput(command: String, input: String, timeoutSeconds: Int = 30): ToolResult {
        return try {
            val processBuilder = ProcessBuilder()
            processBuilder.command(
                "/data/data/com.termux/files/usr/bin/sh",
                "-c",
                "echo '$input' | $command"
            )
            processBuilder.redirectErrorStream(true)

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
                    return ToolResult.Error("Command timed out")
                }
            }

            val exitCode = process.waitFor()
            val result = output.toString().trim()

            if (exitCode == 0) {
                ToolResult.Success(
                    result = if (result.isEmpty()) "Operation completed successfully" else result
                )
            } else {
                ToolResult.Error("Operation failed with exit code $exitCode\nOutput:\n$result")
            }
        } catch (e: Exception) {
            ToolResult.Error("Failed to execute API command: ${e.message}")
        }
    }
}
