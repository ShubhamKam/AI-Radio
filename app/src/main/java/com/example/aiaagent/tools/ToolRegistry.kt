package com.example.aiaagent.tools

import android.content.Context

class ToolRegistry(private val context: Context) {
    
    private val tools = mutableMapOf<String, Tool>()
    
    init {
        registerDefaultTools()
    }
    
    private fun registerDefaultTools() {
        register(LaunchAppTool())
        register(GetInstalledAppsTool())
        register(GetBatteryStatusTool())
        register(GetNetworkInfoTool())
        register(GetStorageInfoTool())
        register(CalculatorTool())
        register(GetSystemInfoTool())
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
