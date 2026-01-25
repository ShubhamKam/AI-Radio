package com.example.aiaagent.tools

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager

class GetBatteryStatusTool : Tool {
    override val name = "get_battery_status"
    override val description = "Get the current battery status including level, charging state, and health"
    override val parameters = mapOf(
        "type" to "object",
        "properties" to emptyMap<String, Any>()
    )
    
    override suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult {
        return try {
            val batteryStatus: Intent? = IntentFilter(Intent.ACTION_BATTERY_CHANGED).let { filter ->
                context.registerReceiver(null, filter)
            }
            
            val level = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
            val scale = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
            val batteryPct = level * 100 / scale.toFloat()
            
            val status = batteryStatus?.getIntExtra(BatteryManager.EXTRA_STATUS, -1) ?: -1
            val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING ||
                    status == BatteryManager.BATTERY_STATUS_FULL
            
            val chargePlug = batteryStatus?.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1) ?: -1
            val chargingSource = when (chargePlug) {
                BatteryManager.BATTERY_PLUGGED_USB -> "USB"
                BatteryManager.BATTERY_PLUGGED_AC -> "AC Adapter"
                BatteryManager.BATTERY_PLUGGED_WIRELESS -> "Wireless"
                else -> "Not charging"
            }
            
            val health = batteryStatus?.getIntExtra(BatteryManager.EXTRA_HEALTH, -1) ?: -1
            val healthStatus = when (health) {
                BatteryManager.BATTERY_HEALTH_GOOD -> "Good"
                BatteryManager.BATTERY_HEALTH_OVERHEAT -> "Overheating"
                BatteryManager.BATTERY_HEALTH_DEAD -> "Dead"
                BatteryManager.BATTERY_HEALTH_OVER_VOLTAGE -> "Over Voltage"
                BatteryManager.BATTERY_HEALTH_COLD -> "Cold"
                else -> "Unknown"
            }
            
            val result = buildString {
                append("Battery Status:\n")
                append("- Level: ${batteryPct.toInt()}%\n")
                append("- Charging: ${if (isCharging) "Yes" else "No"}\n")
                append("- Charging Source: $chargingSource\n")
                append("- Health: $healthStatus")
            }
            
            ToolResult.Success(
                result = result,
                data = mapOf(
                    "level" to batteryPct.toInt(),
                    "isCharging" to isCharging,
                    "chargingSource" to chargingSource,
                    "health" to healthStatus
                )
            )
        } catch (e: Exception) {
            ToolResult.Error("Failed to get battery status: ${e.message}")
        }
    }
}
