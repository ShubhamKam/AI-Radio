package com.example.aiaagent.tools

import android.content.Context

interface Tool {
    val name: String
    val description: String
    val parameters: Map<String, Any>
    
    suspend fun execute(context: Context, arguments: Map<String, Any>): ToolResult
}

sealed class ToolResult {
    data class Success(val result: String, val data: Any? = null) : ToolResult()
    data class Error(val message: String) : ToolResult()
}
