package com.example.aiaagent.tools.termux

import android.content.Context
import com.example.aiaagent.tools.Tool
import com.example.aiaagent.tools.ToolResult

/**
 * Access Termux:API system features (battery, wifi, clipboard, toast, vibrate, TTS,
 * notifications, camera, location, sensors, etc.).
 */
class TermuxSystemTool : Tool {
    override val name = "termux_system"
    override val description = "Access Termux:API system features on this Android device. " +
            "Includes: battery status, WiFi info, clipboard access, toast messages, vibrate, " +
            "text-to-speech, notifications, camera capture, GPS location, brightness control, " +
            "volume control, torch/flashlight, fingerprint auth, media player, contacts, SMS, " +
            "call log, telephony info, sensor data, wallpaper, and more."
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "action" to mapOf(
                "type" to "string",
                "description" to "Termux:API action: 'battery', 'wifi', 'clipboard_get', 'clipboard_set', " +
                        "'toast', 'vibrate', 'tts', 'notification', 'camera', 'location', " +
                        "'brightness', 'volume', 'torch', 'fingerprint', 'media_player', " +
                        "'contacts', 'sms_list', 'sms_send', 'call_log', 'telephony', " +
                        "'sensor', 'wallpaper', 'download', 'share', 'dialog', 'tts_engines', " +
                        "'usb', 'infrared', 'microphone', 'speech_to_text'"
            ),
            "text" to mapOf(
                "type" to "string",
                "description" to "Text content (for clipboard_set, toast, tts, notification, sms_send, share)"
            ),
            "title" to mapOf(
                "type" to "string",
                "description" to "Title (for notification)"
            ),
            "value" to mapOf(
                "type" to "string",
                "description" to "Value parameter (for brightness 0-255, volume 0-15, etc.)"
            ),
            "target" to mapOf(
                "type" to "string",
                "description" to "Target (phone number for sms_send, camera id for camera: 0=back, 1=front)"
            ),
            "duration" to mapOf(
                "type" to "number",
                "description" to "Duration in milliseconds (for vibrate, media_player)"
            )
        ),
        "required" to listOf("action")
    )

    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        val action = arguments["action"] as? String
            ?: return ToolResult.Error("Action is required")
        val text = arguments["text"] as? String
        val title = arguments["title"] as? String
        val value = arguments["value"] as? String
        val target = arguments["target"] as? String
        val duration = (arguments["duration"] as? Number)?.toLong()

        val bridge = TermuxBridge(context)

        if (!bridge.isTermuxInstalled()) {
            return ToolResult.Error("Termux is not installed.")
        }

        val command = when (action.lowercase()) {
            // Device Info
            "battery" -> "termux-battery-status"
            "wifi" -> "termux-wifi-connectioninfo"
            "wifi_scan" -> "termux-wifi-scaninfo"
            "telephony" -> "termux-telephony-deviceinfo"
            "location" -> "termux-location -p gps 2>/dev/null || termux-location -p network"

            // Clipboard
            "clipboard_get" -> "termux-clipboard-get"
            "clipboard_set" -> {
                if (text == null) return ToolResult.Error("Text is required for clipboard_set")
                val escaped = text.replace("'", "'\\''")
                "echo '${escaped}' | termux-clipboard-set && echo 'Clipboard updated'"
            }

            // User Interaction
            "toast" -> {
                if (text == null) return ToolResult.Error("Text is required for toast")
                val escaped = text.replace("'", "'\\''")
                "termux-toast '${escaped}'"
            }
            "vibrate" -> {
                val dur = duration ?: 500
                "termux-vibrate -d $dur && echo 'Vibrated for ${dur}ms'"
            }
            "tts", "speak" -> {
                if (text == null) return ToolResult.Error("Text is required for TTS")
                val escaped = text.replace("'", "'\\''")
                "termux-tts-speak '${escaped}' && echo 'Speech completed'"
            }
            "tts_engines" -> "termux-tts-engines"
            "speech_to_text" -> "termux-speech-to-text"

            // Notifications
            "notification" -> {
                val titlePart = if (title != null) "--title '${title.replace("'", "'\\''")}'" else ""
                val contentPart = if (text != null) "--content '${text.replace("'", "'\\''")}'" else ""
                "termux-notification $titlePart $contentPart"
            }

            // Camera
            "camera" -> {
                val cameraId = target ?: "0"
                val photoPath = "${TermuxBridge.TERMUX_HOME}/camera_capture_${System.currentTimeMillis()}.jpg"
                "termux-camera-photo -c $cameraId '$photoPath' && echo 'Photo saved to: $photoPath'"
            }

            // Hardware Controls
            "brightness" -> {
                if (value == null) return ToolResult.Error("Value (0-255) is required for brightness")
                "termux-brightness $value && echo 'Brightness set to $value'"
            }
            "volume" -> {
                if (value == null) return ToolResult.Error("Value is required for volume (e.g., 'music 10')")
                "termux-volume $value"
            }
            "torch", "flashlight" -> {
                val state = value ?: "on"
                "termux-torch $state && echo 'Torch turned $state'"
            }

            // Security
            "fingerprint" -> "termux-fingerprint"

            // Media
            "media_player" -> {
                if (text == null) return ToolResult.Error("File path or URL is required for media_player")
                "termux-media-player play '$text'"
            }

            // Contacts & Communication
            "contacts" -> "termux-contact-list"
            "sms_list" -> {
                val limit = value ?: "10"
                "termux-sms-list -l $limit"
            }
            "sms_send" -> {
                if (target == null) return ToolResult.Error("Phone number (target) is required for sms_send")
                if (text == null) return ToolResult.Error("Text is required for sms_send")
                val escaped = text.replace("'", "'\\''")
                "termux-sms-send -n '$target' '${escaped}' && echo 'SMS sent to $target'"
            }
            "call_log" -> {
                val limit = value ?: "10"
                "termux-call-log -l $limit"
            }

            // Sensors
            "sensor" -> {
                val sensorName = value ?: ""
                if (sensorName.isBlank()) {
                    "termux-sensor -l"
                } else {
                    "termux-sensor -s '$sensorName' -n 1"
                }
            }

            // System
            "wallpaper" -> {
                if (text == null) return ToolResult.Error("Image file path is required for wallpaper")
                "termux-wallpaper -f '$text' && echo 'Wallpaper set'"
            }
            "download" -> {
                if (text == null) return ToolResult.Error("URL is required for download")
                val desc = title ?: "Download"
                "termux-download -d '${desc}' '$text' && echo 'Download started'"
            }
            "share" -> {
                if (text == null) return ToolResult.Error("Text or file path is required for share")
                val escaped = text.replace("'", "'\\''")
                "echo '${escaped}' | termux-share"
            }
            "dialog" -> {
                val dialogTitle = title ?: "Input"
                "termux-dialog -t '${dialogTitle}'"
            }
            "usb" -> "termux-usb -l"
            "infrared" -> {
                if (text == null) return ToolResult.Error("Frequency and pattern required for infrared")
                "termux-infrared-transmit -f $text"
            }
            "microphone" -> {
                val dur = duration ?: 5000
                val filePath = "${TermuxBridge.TERMUX_HOME}/recording_${System.currentTimeMillis()}.m4a"
                "termux-microphone-record -l ${dur / 1000} -f '$filePath' && echo 'Recording saved to: $filePath'"
            }

            else -> return ToolResult.Error(
                "Unknown action: $action. Available actions: battery, wifi, clipboard_get, clipboard_set, " +
                        "toast, vibrate, tts, notification, camera, location, brightness, volume, torch, " +
                        "fingerprint, media_player, contacts, sms_list, sms_send, call_log, telephony, " +
                        "sensor, wallpaper, download, share, dialog, tts_engines, speech_to_text, usb, " +
                        "infrared, microphone"
            )
        }

        val result = bridge.executeCommand(
            command = command,
            timeoutMs = TermuxBridge.DEFAULT_TIMEOUT_MS
        )

        return if (result.success) {
            ToolResult.Success(
                result = result.toDisplayString(),
                data = mapOf(
                    "action" to action,
                    "output" to result.stdout
                )
            )
        } else {
            val errorMsg = if (result.stderr.contains("not found") || result.stderr.contains("No such file")) {
                "Termux:API may not be installed. Install it with: pkg install termux-api\n${result.toDisplayString()}"
            } else {
                result.toDisplayString()
            }
            ToolResult.Error("Termux:API operation failed: $errorMsg")
        }
    }
}
