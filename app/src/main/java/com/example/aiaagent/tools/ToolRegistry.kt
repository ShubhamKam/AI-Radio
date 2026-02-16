package com.example.aiaagent.tools

import android.content.Context
import com.example.aiaagent.tools.termux.TermuxCommandTool
import com.example.aiaagent.tools.termux.TermuxFileManagerTool
import com.example.aiaagent.tools.termux.TermuxNetworkTool
import com.example.aiaagent.tools.termux.TermuxPackageManagerTool
import com.example.aiaagent.tools.termux.TermuxProcessManagerTool
import com.example.aiaagent.tools.termux.TermuxScriptRunnerTool
import com.example.aiaagent.tools.termux.TermuxStorageTool
import com.example.aiaagent.tools.termux.TermuxSystemTool

class ToolRegistry(private val context: Context) {

    private val tools = mutableMapOf<String, Tool>()

    init {
        registerDefaultTools()
    }

    private fun registerDefaultTools() {
        // Core device tools
        register(LaunchAppTool())
        register(GetInstalledAppsTool())
        register(GetBatteryStatusTool())
        register(GetNetworkInfoTool())
        register(GetStorageInfoTool())
        register(CalculatorTool())
        register(GetSystemInfoTool())

        // Termux tools
        register(TermuxCommandTool())
        register(TermuxPackageManagerTool())
        register(TermuxFileManagerTool())
        register(TermuxProcessManagerTool())
        register(TermuxNetworkTool())
        register(TermuxScriptRunnerTool())
        register(TermuxSystemTool())
        register(TermuxStorageTool())
    }

    fun register(tool: Tool) {
        tools[tool.name] = tool
    }

    fun getTool(name: String): Tool? = tools[name]

    fun getAllTools(): List<Tool> = tools.values.toList()

    suspend fun executeTool(name: String, arguments: Map<String, Any>): ToolResult {
        val tool = getTool(name)
        return if (tool != null) {
            tool.execute(context, arguments)
        } else {
            ToolResult.Error("Tool '$name' not found")
        }
    }
}
