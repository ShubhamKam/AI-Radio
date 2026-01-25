package com.example.aiaagent.data.api

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

interface OpenAIService {
    @POST("v1/chat/completions")
    suspend fun createChatCompletion(
        @Header("Authorization") authorization: String,
        @Body request: OpenAIRequest
    ): Response<OpenAIResponse>
}

data class OpenAIRequest(
    val model: String = "gpt-4",
    val messages: List<OpenAIMessage>,
    val tools: List<OpenAITool>? = null,
    val tool_choice: String? = null,
    val temperature: Double = 0.7,
    val max_tokens: Int? = null
)

data class OpenAIMessage(
    val role: String,
    val content: String? = null,
    val tool_calls: List<OpenAIToolCall>? = null,
    val tool_call_id: String? = null,
    val name: String? = null
)

data class OpenAITool(
    val type: String = "function",
    val function: OpenAIFunction
)

data class OpenAIFunction(
    val name: String,
    val description: String,
    val parameters: Map<String, Any>
)

data class OpenAIToolCall(
    val id: String,
    val type: String,
    val function: OpenAIFunctionCall
)

data class OpenAIFunctionCall(
    val name: String,
    val arguments: String
)

data class OpenAIResponse(
    val id: String,
    val choices: List<OpenAIChoice>,
    val usage: OpenAIUsage? = null
)

data class OpenAIChoice(
    val index: Int,
    val message: OpenAIMessage,
    val finish_reason: String
)

data class OpenAIUsage(
    val prompt_tokens: Int,
    val completion_tokens: Int,
    val total_tokens: Int
)
