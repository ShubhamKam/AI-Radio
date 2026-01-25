package com.example.aiaagent.tools

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build

class GetNetworkInfoTool : Tool {
    override val name = "get_network_info"
    override val description = "Get information about the current network connection"
    override val parameters = mapOf(
        "type" to "object",
        "properties" to emptyMap<String, Any>()
    )
    
    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        return try {
            val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val network = connectivityManager.activeNetwork
                val capabilities = connectivityManager.getNetworkCapabilities(network)
                
                if (capabilities != null) {
                    val isConnected = capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                    val connectionType = when {
                        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "WiFi"
                        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "Mobile Data"
                        capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> "Ethernet"
                        else -> "Unknown"
                    }
                    
                    val result = buildString {
                        append("Network Status:\n")
                        append("- Connected: ${if (isConnected) "Yes" else "No"}\n")
                        append("- Connection Type: $connectionType\n")
                        append("- Validated: ${capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)}")
                    }
                    
                    ToolResult.Success(
                        result = result,
                        data = mapOf(
                            "isConnected" to isConnected,
                            "connectionType" to connectionType
                        )
                    )
                } else {
                    ToolResult.Success("No active network connection")
                }
            } else {
                @Suppress("DEPRECATION")
                val networkInfo = connectivityManager.activeNetworkInfo
                val isConnected = networkInfo?.isConnected ?: false
                val connectionType = networkInfo?.typeName ?: "Unknown"
                
                ToolResult.Success(
                    result = "Network Status:\n- Connected: ${if (isConnected) "Yes" else "No"}\n- Type: $connectionType",
                    data = mapOf(
                        "isConnected" to isConnected,
                        "connectionType" to connectionType
                    )
                )
            }
        } catch (e: Exception) {
            ToolResult.Error("Failed to get network info: ${e.message}")
        }
    }
}
