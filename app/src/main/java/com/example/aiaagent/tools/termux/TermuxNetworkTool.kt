package com.example.aiaagent.tools.termux

import android.content.Context
import com.example.aiaagent.tools.Tool
import com.example.aiaagent.tools.ToolResult

/**
 * Termux-specific networking operations (curl, wget, ping, ssh, etc.).
 */
class TermuxNetworkTool : Tool {
    override val name = "termux_network"
    override val description = "Perform network operations in Termux. Supports curl/wget for HTTP requests, " +
            "ping for connectivity checks, ifconfig/ip for network interfaces, ssh for remote connections, " +
            "nmap for port scanning, and netstat for connection monitoring."
    override val parameters = mapOf(
        "type" to "object",
        "properties" to mapOf(
            "action" to mapOf(
                "type" to "string",
                "description" to "Network action: 'curl', 'wget', 'ping', 'ifconfig', 'ssh', 'netstat', 'nslookup', 'traceroute', 'port_scan'"
            ),
            "target" to mapOf(
                "type" to "string",
                "description" to "Target URL, hostname, or IP address"
            ),
            "options" to mapOf(
                "type" to "string",
                "description" to "Additional command options/flags"
            ),
            "port" to mapOf(
                "type" to "number",
                "description" to "Port number (for ssh, port_scan)"
            ),
            "username" to mapOf(
                "type" to "string",
                "description" to "Username (for ssh)"
            )
        ),
        "required" to listOf("action")
    )

    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        val action = arguments["action"] as? String
            ?: return ToolResult.Error("Action is required")
        val target = arguments["target"] as? String
        val options = arguments["options"] as? String ?: ""
        val port = (arguments["port"] as? Number)?.toInt()
        val username = arguments["username"] as? String

        val bridge = TermuxBridge(context)

        if (!bridge.isTermuxInstalled()) {
            return ToolResult.Error("Termux is not installed.")
        }

        val command = when (action.lowercase()) {
            "curl" -> {
                if (target == null) return ToolResult.Error("Target URL is required for curl")
                "curl -sS $options '$target' 2>&1 | head -200"
            }
            "wget" -> {
                if (target == null) return ToolResult.Error("Target URL is required for wget")
                "wget $options '$target' -O - 2>&1 | head -200"
            }
            "ping" -> {
                if (target == null) return ToolResult.Error("Target host is required for ping")
                "ping -c 4 $options '$target' 2>&1"
            }
            "ifconfig" -> "ifconfig 2>/dev/null || ip addr show 2>/dev/null"
            "ip" -> "ip addr show 2>/dev/null"
            "ssh" -> {
                if (target == null) return ToolResult.Error("Target host is required for ssh")
                val userPart = if (username != null) "$username@" else ""
                val portPart = if (port != null) "-p $port" else ""
                return ToolResult.Error("SSH interactive sessions are not supported. Use 'termux_execute' with a specific ssh command like: ssh $userPart$target $portPart 'your_command'")
            }
            "netstat" -> "netstat -tlnp 2>/dev/null || ss -tlnp 2>/dev/null"
            "nslookup", "dns" -> {
                if (target == null) return ToolResult.Error("Target hostname is required for nslookup")
                "nslookup '$target' 2>&1 || dig '$target' 2>&1 || host '$target' 2>&1"
            }
            "traceroute" -> {
                if (target == null) return ToolResult.Error("Target host is required for traceroute")
                "traceroute '$target' 2>&1 || tracepath '$target' 2>&1"
            }
            "port_scan" -> {
                if (target == null) return ToolResult.Error("Target host is required for port scan")
                val portRange = if (port != null) "-p $port" else "-p 1-1024"
                "nmap $portRange '$target' 2>&1 || echo 'nmap not installed. Install with: pkg install nmap'"
            }
            else -> return ToolResult.Error("Unknown action: $action. Use: curl, wget, ping, ifconfig, ssh, netstat, nslookup, traceroute, port_scan")
        }

        val timeoutMs = when (action.lowercase()) {
            "traceroute", "port_scan" -> TermuxBridge.LONG_TIMEOUT_MS
            else -> TermuxBridge.DEFAULT_TIMEOUT_MS
        }

        val result = bridge.executeCommand(command = command, timeoutMs = timeoutMs)

        return if (result.success) {
            ToolResult.Success(
                result = result.toDisplayString(),
                data = mapOf(
                    "action" to action,
                    "target" to (target ?: ""),
                    "output" to result.stdout
                )
            )
        } else {
            ToolResult.Error("Network operation failed: ${result.toDisplayString()}")
        }
    }
}
