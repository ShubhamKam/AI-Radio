package com.example.aiaagent.data.model

data class AgentResponse(
    val provider: AIProvider,
    val message: String,
    val reasoning: String,
    val toolAction: ToolAction? = null,
    val timestamp: Long = System.currentTimeMillis()
)
