package com.example.aiaagent.data.model

data class AIResponse(
    val content: String,
    val provider: AIProvider,
    val timestamp: Long = System.currentTimeMillis()
)

enum class AIProvider {
    OPENAI,
    GOOGLE_AI,
    LOCAL_MODEL
}